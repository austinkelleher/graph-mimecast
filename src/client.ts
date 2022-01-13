import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import { createHmac } from 'crypto';
import { v4 as uuid } from 'uuid';
import got, { Response } from 'got';
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
    const uri = '/api/account/get-account';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
    });
    let result: Response<string>;
    try {
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

  // TODO: pagination support
  public async getUsers(domain: string): Promise<User[]> {
    const uri = '/api/user/get-internal-users';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: JSON.stringify({
        data: [
          {
            domain,
          },
        ],
      }),
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
    if (!response.data.length) {
      return [];
    }
    return response.data[0].users;
  }

  public async getAwarenessCampaigns(): Promise<AwarenessCampaign[]> {
    const uri = '/api/awareness-training/campaign/get-campaigns';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
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

  public async getAwarenessCampaignUserData(
    campaignId: string,
  ): Promise<AwarenessCampaignUserData[]> {
    const uri = '/api/awareness-training/campaign/get-user-data';
    const endpoint = BASE_URI + uri;
    const request = got.post(endpoint, {
      headers: this.generateHeaders(uri),
      body: JSON.stringify({
        data: [{ id: campaignId }],
      }),
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
    if (!response.data.length) {
      return [];
    }
    return response.data[0].items;
  }
}

export function createAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  return new APIClient(config, logger);
}
