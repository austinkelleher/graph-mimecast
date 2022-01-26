import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { AwarenessCampaign } from '../../types';
import { Entities } from '../constants';

export function createAwarenessCampaignEntity(
  awarenessCampaign: AwarenessCampaign,
): Entity {
  // trim properties not pertinent for asset tracking
  awarenessCampaign = {
    ...awarenessCampaign,
    numCorrectAnswers: undefined,
    allOtherCampaigns: undefined,
    title: undefined,
    emailMsg: undefined,
  } as any;
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
