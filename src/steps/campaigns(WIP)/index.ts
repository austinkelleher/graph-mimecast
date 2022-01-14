import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { Entities, Steps } from '../constants';

export async function fetchCampaigns({
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const campaigns = await apiClient.getCampaigns();

  for (const campaign of campaigns) {
    console.log(campaign.id);
  }
}

export const campaignSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.CAMPAIGNS,
    name: 'Fetch Campaigns',
    entities: [Entities.CAMPAIGN],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCampaigns,
  },
];
