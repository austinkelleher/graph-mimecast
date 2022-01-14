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
import { createDomainEntity } from './converter';

export async function fetchDomains({
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
  const domains = await apiClient.getDomains();

  for (const domain of domains) {
    const domainEntity = createDomainEntity(domain);
    await jobState.addEntity(domainEntity);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: domainEntity,
      }),
    );
  }
}

export const domainSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.DOMAINS,
    name: 'Fetch Domains',
    entities: [Entities.DOMAIN],
    relationships: [Relationships.ACCOUNT_HAS_DOMAIN],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchDomains,
  },
];
