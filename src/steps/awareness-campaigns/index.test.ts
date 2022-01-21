import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { fetchAwarenessCampaignEnrollment, fetchAwarenessCampaigns } from '.';
import { integrationConfig } from '../../../test/config';
import { setupMimecastRecording } from '../../../test/recording';
import { fetchAccountDetails } from '../account';
import { Entities, Relationships } from '../constants';
import { fetchDomains } from '../domains';
import { fetchUsers } from '../users';

describe('#fetchAwarenessCampaigns', () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    recording = setupMimecastRecording({
      directory: __dirname,
      name: 'fetchAwarenessCampaignsShouldCollectData',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    await fetchAccountDetails(context);
    await fetchAwarenessCampaigns(context);
    expect(context.jobState.collectedEntities?.length).toBeTruthy;
    expect(
      context.jobState.collectedEntities.filter(
        (r) => r._type === Entities.AWARENESS_CAMPAIGN._type,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Training'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'mimecast_awareness_campaign' },
          _key: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          locked: { type: 'boolean' },
          launchDate: { type: 'string' },
          numSent: { type: 'number' },
          numCompleted: { type: 'number' },
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

  test('should build account to awareness campaign relationship', async () => {
    recording = setupMimecastRecording({
      directory: __dirname,
      name: 'fetchAwarenessCampaignsShouldBuildAccountRelationship',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    await fetchAccountDetails(context);
    await fetchAwarenessCampaigns(context);

    expect(context.jobState.collectedRelationships?.length).toBeTruthy;
    expect(
      context.jobState.collectedRelationships.filter(
        (r) => r._type === Relationships.ACCOUNT_HAS_AWARENESS_CAMPAIGN._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: RelationshipClass.HAS },
          _type: { const: Relationships.ACCOUNT_HAS_AWARENESS_CAMPAIGN._type },
        },
      },
    });
  });
});

describe('#fetchAwarenessCampaignEnrollment', () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });
  test('should build user to awareness campaign relationship', async () => {
    recording = setupMimecastRecording({
      directory: __dirname,
      name: 'fetchAwarenessCampaignEnrollmentShouldBuildUserRelationship',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    await fetchAccountDetails(context);
    await fetchAwarenessCampaigns(context);
    await fetchDomains(context);
    await fetchUsers(context);
    await fetchAwarenessCampaignEnrollment(context);

    expect(context.jobState.collectedRelationships?.length).toBeTruthy;
    expect(
      context.jobState.collectedRelationships.filter(
        (r) =>
          r._type === Relationships.USER_ASSIGNED_AWARENESS_CAMPAIGN._type ||
          r._type === Relationships.USER_COMPLETED_AWARENESS_CAMPAIGN._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: {
            enum: [RelationshipClass.ASSIGNED, RelationshipClass.COMPLETED],
          },
          _type: {
            enum: [
              Relationships.USER_ASSIGNED_AWARENESS_CAMPAIGN._type,
              Relationships.USER_COMPLETED_AWARENESS_CAMPAIGN._type,
            ],
          },
        },
      },
    });
  });
});
