import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { Entities } from '../constants';
import { Account } from '../../types';

export function createAccountEntity(account: Account): Entity {
  return createIntegrationEntity({
    entityData: {
      source: account,
      assign: {
        _type: Entities.ACCOUNT._type,
        _class: Entities.ACCOUNT._class,
        _key: account.mimecastId,
        name: account.accountName,
        displayName: account.accountName,
        accountCode: account.accountCode,
      },
    },
  });
}
