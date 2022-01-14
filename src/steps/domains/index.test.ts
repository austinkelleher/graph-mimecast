import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { fetchDomains } from '.';
import { integrationConfig } from '../../../test/config';
import { setupMimecastRecording } from '../../../test/recording';
import { fetchAccountDetails } from '../account';
import { Entities, Relationships } from '../constants';

describe('#fetchDomains', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    recording = setupMimecastRecording({
      directory: __dirname,
      name: 'fetchDomainsShouldCollectData',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    await fetchAccountDetails(context);
    await fetchDomains(context);

    expect(context.jobState.collectedEntities?.length).toBeTruthy;
    expect(
      context.jobState.collectedEntities.filter(
        (r) => r._type === Entities.DOMAIN._type,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Domain'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'mimecast_domain' },
          _key: { type: 'string' },
          name: { type: 'string' },
          domainName: { type: 'string' },
          displayName: { type: 'string' },
          sendOnly: { type: 'boolean' },
          local: { type: 'boolean' },
          inboundType: { type: 'string' },
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

  test('should build account to domain relationship', async () => {
    recording = setupMimecastRecording({
      directory: __dirname,
      name: 'fetchDomainsShouldBuildAccountRelationship',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    await fetchAccountDetails(context);
    await fetchDomains(context);

    expect(context.jobState.collectedRelationships?.length).toBeTruthy;
    expect(
      context.jobState.collectedRelationships.filter(
        (r) => r._type === Relationships.ACCOUNT_HAS_DOMAIN._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: RelationshipClass.HAS },
          _type: { const: Relationships.ACCOUNT_HAS_DOMAIN._type },
        },
      },
    });
  });
});
