import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, Steps } from '../constants';
import { createUserEntity } from './converter';

export async function fetchUsers({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: Entities.DOMAIN._type },
    async (domain) => {
      let nextBatchId;
      do {
        const getUserBatchResponse = await apiClient.getUserBatch(
          domain.displayName as string,
          nextBatchId,
        );
        const users = getUserBatchResponse.users;
        nextBatchId = getUserBatchResponse.nextBatchId;
        for (const user of users) {
          const userEntity = createUserEntity(user);
          await jobState.addEntity(userEntity);
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: domain,
              to: userEntity,
            }),
          );
        }
      } while (nextBatchId);
    },
  );
}

export const userSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.USERS,
    name: 'Fetch Users',
    entities: [Entities.USER],
    relationships: [Relationships.DOMAIN_HAS_USER],
    dependsOn: [Steps.DOMAINS],
    executionHandler: fetchUsers,
  },
];
