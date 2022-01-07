import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { User } from '../../types';
import { Entities } from '../constants';

export function createUserEntity(user: User): Entity {
  return createIntegrationEntity({
    entityData: {
      source: user,
      assign: {
        _type: Entities.USER._type,
        _class: Entities.USER._class,
        _key: user.emailAddress,
        username: user.emailAddress,
        active: true,
        name: user.name,
        displayName: user.name,
        emailDomain: [user.domain],
        email: user.emailAddress,
        alias: user.alias,
        addressType: user.addressType,
        source: user.source,
      },
    },
  });
}
