import { accountSteps } from './account';
import { domainSteps } from './domains';
import { userSteps } from './users';
import { awarenessCampaignSteps } from './awareness-campaigns';
const integrationSteps = [
  ...accountSteps,
  ...domainSteps,
  ...userSteps,
  ...awarenessCampaignSteps,
];

export { integrationSteps };
