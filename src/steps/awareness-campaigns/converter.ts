import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { AwarenessCampaign } from '../../types';
import { Entities } from '../constants';

//TODO: finish enumerating searchable info in converter...strip out unnecessary info from source...
export function createAwarenessCampaignEntity(
  awarenessCampaign: AwarenessCampaign,
): Entity {
  awarenessCampaign = {
    ...awarenessCampaign,
    numCorrectAnswers: undefined,
    allOtherCampaigns: undefined,
    title: undefined,
    emailMsg: undefined,
  };
  return createIntegrationEntity({
    entityData: {
      source: awarenessCampaign,
      assign: {
        _type: Entities.AWARENESS_CAMPAIGN._type,
        _class: Entities.AWARENESS_CAMPAIGN._class,
        _key: awarenessCampaign.id,
        name: awarenessCampaign.name,
        displayName: awarenessCampaign.name,
        locked: awarenessCampaign.locked,
        launchDate: awarenessCampaign.launchDate,
        numSent: awarenessCampaign.numSent,
        numCompleted: awarenessCampaign.numCompleted,
      },
    },
  });
}
