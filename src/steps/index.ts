import { accountSteps } from './account';
import { domainSteps } from './domains';
import { userSteps } from './users';
// import { campaignSteps } from "./campaigns";  // TODO: finish when/if we get training campaigns added
const integrationSteps = [...accountSteps, ...domainSteps, ...userSteps];

export { integrationSteps };
