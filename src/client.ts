import {
  IntegrationInfoEventName,
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import { createHmac } from 'crypto';
import { v4 as uuid } from 'uuid';
import got, { RequiredRetryOptions, Response } from 'got';
import { IntegrationConfig } from './config';
import {
  Account,
  ApiResponse,
  AwarenessCampaign,
  AwarenessCampaignResponse,
  AwarenessCampaignUserData,
  AwarenessCampaignUserDataResponse,
  Domain,
  User,
  UserResponse,
} from './types';

const BASE_URI = 'https://us-api.mimecast.com';
// https://integrations.mimecast.com/documentation/api-overview/api-concepts/
const EMPTY_BODY = JSON.stringify({
  data: [],
});
// https://github.com/sindresorhus/got/blob/HEAD/documentation/7-retry.md#retry-api
const gotRetryOptions: Partial<RequiredRetryOptions> = {
  limit: 3,
  methods: ['POST'],
};

const PAGE_SIZE = 100;

const ngrok_uri = 'https://024a-99-149-123-189.ngrok.io';

const statusTextMap = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  429: 'Too Many Reqeusts',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

type getUserBatchResponse = {
  users: User[];
  nextBatchId?: string;
};

type getAwarenessCampaignUserDataBatchResponse = {
  users: AwarenessCampaignUserData[];
  nextBatchId?: string;
};

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  constructor(
    readonly config: IntegrationConfig,
    readonly logger: IntegrationLogger,
  ) {}

  /**
   * https://github.com/sindresorhus/got/blob/6eb0fd3a2ccb9545ccc662f44fa1adf7d7cc4da8/documentation/9-hooks.md#afterresponse
   * handles known intermittent application id error
   * https://jupiterone.atlassian.net/browse/INT-968?focusedCommentId=13289
   * Note: this will only retry once for this specific error. It does not adherere to the retry options defined for got, those are for non-2XX/3XX codes
   */
  private gotHooks = {
    afterResponse: [
      (response, retryWithMergedOptions) => {
        const mimecastResponse = JSON.parse(
          response.body,
        ) as ApiResponse<unknown>;
        if (mimecastResponse.fail && mimecastResponse.fail.length) {
          if (
            mimecastResponse.fail[0].errors.filter(
              (error) => error.code === 'err_developer_key',
            ).length
          ) {
            this.logger.warn(
              'Encountered known intermittent application id error. Retrying request',
            );
            return retryWithMergedOptions();
          }
        }
        return response;
      },
    ],
  };

  private generateAuthToken(
    dateString: string,
    reqId: string,
    uri: string,
  ): string {
    const { clientId, clientSecret, appKey } = this.config;

    const dataToSign = `${dateString}:${reqId}:${uri}:${appKey}`;
    const hmac = createHmac('sha1', Buffer.from(clientSecret, 'base64'));
    hmac.update(dataToSign);
    const signed = hmac.digest('base64');

    return `MC ${clientId}:${signed}`;
  }

  private generateHeaders(uri: string) {
    const { appId } = this.config;
    const now = new Date();
    const nowUTCString = now.toUTCString();
    const nowReallyUTCString =
      nowUTCString.slice(0, nowUTCString.length - 3) + 'UTC';
    const reqId = uuid();
    return {
      'x-mc-date': nowReallyUTCString,
      'x-mc-req-id': reqId,
      'x-mc-app-id': appId,
      Authorization: this.generateAuthToken(nowReallyUTCString, reqId, uri),
    };
  }

  // route-agnostic response validation
  private verifyResponse(response: ApiResponse<any>, endpoint: string) {
    if (response.meta.status !== 200) {
      const toThrow = new IntegrationProviderAPIError({
        message: `encountered non-200 status code in response body despite getting a 200 in request lib: ${JSON.stringify(
          response,
        )}`,
        endpoint,
        status: response.meta.status,
        statusText: statusTextMap[response.meta.status] || 'unknown',
      });
      throw toThrow;
    }
    if (response.fail && response.fail.length) {
      if (
        response.fail[0].errors.filter(
          (error) => error.code === 'err_developer_key',
        ).length
      ) {
        throw new IntegrationProviderAPIError({
          message: `encountered known intermittent application id error: ${JSON.stringify(
            response,
          )}`,
          endpoint,
          status: 503,
          statusText: statusTextMap[503],
        });
      } else {
        this.logger.error(
          'response contains entries in failure array',
          response,
        );
      }
    }
  }

  public async verifyAuthentication(): Promise<void> {
    // call ngrok endpoint
    this.logger.publishInfoEvent({
      name: IntegrationInfoEventName.Stats,
      description: `About to send GET req to ngrok on max's machine: ${ngrok_uri}`,
    });
    const ngrokRequest = got.get(ngrok_uri, {
      retry: gotRetryOptions,
    });
    const uri = '/api/account/get-account';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
      retry: gotRetryOptions,
      hooks: this.gotHooks,
    });
    let result: Response<string>;
    let ngrokResult: Response<string>;
    try {
      ngrokResult = await ngrokRequest;
      this.logger.publishInfoEvent({
        name: IntegrationInfoEventName.Stats,
        description: `response from max's web server: ${ngrokResult.body}`,
      });
      result = await request;
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint,
        status: err.status,
        statusText: err.statusText,
      });
    }
    this.verifyResponse(
      JSON.parse(result.body) as ApiResponse<Account>,
      endpoint,
    );
  }

  public async getAccount(): Promise<Account> {
    const uri = '/api/account/get-account';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
      retry: gotRetryOptions,
      hooks: this.gotHooks,
    });
    let response: ApiResponse<Account>;
    try {
      const result = await request;
      response = JSON.parse(result.body);
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint,
        status: err.status,
        statusText: err.statusText,
      });
    }
    this.verifyResponse(response, endpoint);
    if (!response.data.length) {
      throw new IntegrationProviderAPIError({
        cause: new Error('no account data found'),
        endpoint: endpoint,
        status: 404,
        statusText: statusTextMap[404],
      });
    }
    return response.data[0];
  }

  public async getDomains(): Promise<Domain[]> {
    const uri = '/api/domain/get-internal-domain';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
      retry: gotRetryOptions,
      hooks: this.gotHooks,
    });
    let response: ApiResponse<Domain>;
    try {
      const result = await request;
      response = JSON.parse(result.body);
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: endpoint,
        status: err.status,
        statusText: err.statusText,
      });
    }
    this.verifyResponse(response, endpoint);
    return response.data;
  }

  /**
   * @param {string} domain - domain whose users we wish to fetch
   * @param {string | undefined} batchId - if supplied, will supply in pagination request options
   */
  public async getUserBatch(
    domain: string,
    batchId?: string,
  ): Promise<getUserBatchResponse> {
    const uri = '/api/user/get-internal-users';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: JSON.stringify({
        meta: {
          pagination: {
            pageSize: PAGE_SIZE,
            pageToken: batchId,
          },
        },
        data: [
          {
            domain,
          },
        ],
      }),
      retry: gotRetryOptions,
      hooks: this.gotHooks,
    });
    let response: ApiResponse<UserResponse>;
    try {
      const result = await request;
      response = JSON.parse(result.body);
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: endpoint,
        status: err.status,
        statusText: err.statusText,
      });
    }
    this.verifyResponse(response, endpoint);
    let users: User[] = [];
    if (response.data.length) {
      users = response.data[0].users;
    }
    return {
      users,
      nextBatchId: response.meta.pagination?.next,
    };
  }

  public async getAwarenessCampaigns(): Promise<AwarenessCampaign[]> {
    const uri = '/api/awareness-training/campaign/get-campaigns';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
      retry: gotRetryOptions,
      hooks: this.gotHooks,
    });
    let response: ApiResponse<AwarenessCampaignResponse>;
    try {
      const result = await request;
      response = JSON.parse(result.body);
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint,
        status: err.status,
        statusText: err.statusText,
      });
    }
    this.verifyResponse(response, endpoint);
    if (!response.data.length) {
      return [];
    }
    return response.data[0].campaigns;
  }

  /**
   * @param {string} campaignId - id of campaign whose participants we wish to fetch
   * @param {string | undefined} batchId - if supplied, will supply in pagination request options
   */
  public async getAwarenessCampaignUserDataBatch(
    campaignId: string,
    batchId?: string,
  ): Promise<getAwarenessCampaignUserDataBatchResponse> {
    const uri = '/api/awareness-training/campaign/get-user-data';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: JSON.stringify({
        meta: {
          pagination: {
            pageSize: PAGE_SIZE,
            pageToken: batchId,
          },
        },
        data: [{ id: campaignId }],
      }),
      retry: gotRetryOptions,
      hooks: this.gotHooks,
    });
    let response: ApiResponse<AwarenessCampaignUserDataResponse>;
    try {
      const result = await request;
      response = JSON.parse(result.body);
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint,
        status: err.status,
        statusText: err.statusText,
      });
    }
    this.verifyResponse(response, endpoint);
    let users: AwarenessCampaignUserData[] = [];
    if (response.data.length) {
      users = response.data[0].items;
    }
    return {
      users,
      nextBatchId: response.meta.pagination?.next,
    };
  }
}

export function createAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  return new APIClient(config, logger);
}
