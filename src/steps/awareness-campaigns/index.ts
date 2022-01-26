import {
  createDirectRelationship,
  Entity,
  IntegrationMissingKeyError,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { ACCOUNT_ENTITY_KEY } from '../account';
import { Entities, Relationships, Steps } from '../constants';
import { createAwarenessCampaignEntity } from './converter';

export async function fetchAwarenessCampaigns({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const accountEntityKey = (await jobState.getData(
    ACCOUNT_ENTITY_KEY,
  )) as string;
  const accountEntity = (await jobState.findEntity(accountEntityKey)) as Entity;
  if (!accountEntity) {
    throw new IntegrationMissingKeyError(
      `Expected to find Account entity in jobState.`,
    );
  }

  const apiClient = createAPIClient(instance.config, logger);
  const campaigns = await apiClient.getAwarenessCampaigns();

  for (const campaign of campaigns) {
    const campaignEntity = createAwarenessCampaignEntity(campaign);
    await jobState.addEntity(campaignEntity);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: campaignEntity,
      }),
    );
  }
}

export async function fetchAwarenessCampaignEnrollment({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);
  await jobState.iterateEntities(
    {
      _type: Entities.AWARENESS_CAMPAIGN._type,
    },
    async (campaignEntity) => {
      let nextBatchId;
      do {
        // grab all users assigned to a given campaign
        const userDataBatchResponse =
          await apiClient.getAwarenessCampaignUserDataBatch(
            campaignEntity._key,
            nextBatchId,
          );
        const userDatas = userDataBatchResponse.users;
        nextBatchId = userDataBatchResponse.nextBatchId;
        for (const userData of userDatas) {
          // if entity for user exists (we use email as _key), create relationship
          const userEntity = await jobState.findEntity(userData.email);
          if (userEntity === null) {
            continue;
          }
          let completedTraining = true;
          // If completed, status will either be CORRECT or INCORRECT, SENT means todo
          for (const status of Object.values(userData.results)) {
            if (status === 'SENT') {
              completedTraining = false;
            }
          }
          await jobState.addRelationship(
            createDirectRelationship({
              _class: completedTraining
                ? RelationshipClass.COMPLETED
                : RelationshipClass.ASSIGNED,
              from: userEntity,
              to: campaignEntity,
            }),
          );
        }
      } while (nextBatchId);
    },
  );
}

export const awarenessCampaignSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.AWARENESS_CAMPAIGNS,
    name: 'Fetch Awareness Campaigns',
    entities: [Entities.AWARENESS_CAMPAIGN],
    relationships: [Relationships.ACCOUNT_HAS_AWARENESS_CAMPAIGN],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchAwarenessCampaigns,
  },
  {
    id: Steps.AWARENESS_CAMPAIGNS_ENROLLMENT,
    name: 'Fetch Awareness Campaigns Enrollment Data',
    entities: [],
    relationships: [
      Relationships.USER_ASSIGNED_AWARENESS_CAMPAIGN,
      Relationships.USER_COMPLETED_AWARENESS_CAMPAIGN,
    ],
    dependsOn: [Steps.USERS, Steps.AWARENESS_CAMPAIGNS],
    executionHandler: fetchAwarenessCampaignEnrollment,
  },
];
