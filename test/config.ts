import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

const DEFAULT_CLIENT_ID = 'dummy-mimecast-access-key';
const DEFAULT_CLIENT_SECRET = 'dummy-mimecast-secret-key';
const DEFAULT_APP_KEY = 'dummy-mimecast-app-key';
const DEFAULT_APP_ID = 'dummy-mimecast-app-id';

export const integrationConfig: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || DEFAULT_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET || DEFAULT_CLIENT_SECRET,
  appKey: process.env.APP_KEY || DEFAULT_APP_KEY,
  appId: process.env.APP_ID || DEFAULT_APP_ID,
};
