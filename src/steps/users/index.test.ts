import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { fetchUsers } from '.';
import { integrationConfig } from '../../../test/config';
import { setupMimecastRecording } from '../../../test/recording';
import { fetchAccountDetails } from '../account';
import { Entities } from '../constants';
import { fetchDomains } from '../domains';

describe('#fetchUsers', () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });
  test('should collect data', async () => {
    recording = setupMimecastRecording({
      directory: __dirname,
      name: 'fetchUsersShouldCollectData',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    await fetchAccountDetails(context);
    await fetchDomains(context);
    await fetchUsers(context);

    expect(context.jobState.collectedEntities?.length).toBeTruthy;
    expect(
      context.jobState.collectedEntities.filter(
        (r) => r._type === Entities.USER._type,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'mimecast_user' },
          _key: { type: 'string' },
          name: { type: 'string' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          active: { type: 'boolean' },
          alias: { type: 'boolean' },
          email: { type: 'string' },
          emailDomain: { type: 'array', items: { type: 'string' } },
          addressType: { type: 'string' },
          source: { type: 'string' },
          createdOn: { type: 'number' },
          createdBy: { type: 'string' },
          updatedOn: { type: 'number' },
          updatedBy: { type: 'string' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
        },
        required: [],
      },
    });
  });
});
