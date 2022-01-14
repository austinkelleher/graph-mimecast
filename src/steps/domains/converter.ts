import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { Domain } from '../../types';
import { Entities } from '../constants';

export function createDomainEntity(domain: Domain): Entity {
  return createIntegrationEntity({
    entityData: {
      source: domain,
      assign: {
        _type: Entities.DOMAIN._type,
        _class: Entities.DOMAIN._class,
        _key: domain.id,
        domainName: domain.domain,
        name: domain.domain,
        displayName: domain.domain,
        sendOnly: domain.sendOnly,
        local: domain.local,
        inboundType: domain.inboundType,
      },
    },
  });
}
