import {
  IntegrationError,
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import { createHmac } from 'crypto';
import * as uuid from 'uuid';
import got from 'got';
import { IntegrationConfig } from './config';
import {
  Account,
  ApiResponse,
  Campaign,
  Domain,
  User,
  UserResponse,
} from './types';

const BASE_URI = 'https://us-api.mimecast.com';
const EMPTY_BODY = JSON.stringify({
  data: [],
});

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
    const reqId = uuid.v4();
    return {
      'x-mc-date': nowReallyUTCString,
      'x-mc-req-id': reqId,
      'x-mc-app-id': appId,
      Authorization: this.generateAuthToken(nowReallyUTCString, reqId, uri),
    };
  }

  private verifyResponse(response: ApiResponse<any>) {
    if (response.meta.status !== 200) {
      const toThrow = new IntegrationError({
        message: `encountered non-200 status code in response body despite getting a 200 in request lib: ${response.meta.status}`,
        code: 'API_CLIENT_RESPONSE_VERIFICATION_ERROR',
      });
      this.logger.error(toThrow, response);
      throw toThrow;
    }
    if (response.fail && response.fail.length) {
      const toThrow = new IntegrationError({
        message: `response contains entries in meta.failure array: ${JSON.stringify(
          response.fail,
        )}`,
        code: 'API_CLIENT_RESPONSE_VERIFICATION_ERROR',
      });
      this.logger.error(toThrow, response);
      throw toThrow;
    }
    if (!response.data || !response.data.length) {
      const toThrow = new IntegrationError({
        message: 'response is missing data',
        code: 'API_CLIENT_RESPONSE_VERIFICATION_ERROR',
      });
      this.logger.error(toThrow, response);
      throw toThrow;
    }
  }

  public async verifyAuthentication(): Promise<void> {
    const uri = '/api/account/get-account';
    const request = got.post(BASE_URI + uri, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
    });

    try {
      const result = await request;
      this.verifyResponse(JSON.parse(result.body) as ApiResponse<Account>);
      console.log(result);
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: BASE_URI + uri,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  public async getAccount(): Promise<Account> {
    const uri = '/api/account/get-account';
    const request = got.post(BASE_URI + uri, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
    });
    try {
      const result = await request;
      const response = JSON.parse(result.body) as ApiResponse<Account>;
      this.verifyResponse(response);
      return response.data[0];
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: BASE_URI + uri,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  public async getDomains(): Promise<Domain[]> {
    const uri = '/api/domain/get-internal-domain';
    const request = got.post(BASE_URI + uri, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
    });
    try {
      const result = await request;
      const response = JSON.parse(result.body) as ApiResponse<Domain>;
      this.verifyResponse(response);
      return response.data;
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: BASE_URI + uri,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  // TODO: pagination support
  public async getUsers(domain: string): Promise<User[]> {
    const uri = '/api/user/get-internal-users';
    const request = got.post(BASE_URI + uri, {
      headers: this.generateHeaders(uri),
      body: JSON.stringify({
        data: [
          {
            domain,
          },
        ],
      }),
    });
    try {
      const result = await request;
      const response = JSON.parse(result.body) as ApiResponse<UserResponse>;
      this.verifyResponse(response);
      return response.data[0].users;
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: BASE_URI + uri,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  // TODO WIP: need access to this part of api
  public async getCampaigns(): Promise<Campaign[]> {
    const uri = '/api/awareness-training/campaign/get-campaigns';
    const request = got.post(BASE_URI + uri, {
      headers: this.generateHeaders(uri),
      body: EMPTY_BODY,
    });
    try {
      const result = await request;
      const response = JSON.parse(result.body) as ApiResponse<Campaign>;
      this.verifyResponse(response);
      return response.data;
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: BASE_URI + uri,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }
}

export function createAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  return new APIClient(config, logger);
}
