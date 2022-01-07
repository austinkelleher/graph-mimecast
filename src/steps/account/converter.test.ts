import { Account } from '../../types';
import { Entities } from '../constants';
import { createAccountEntity } from './converter';

describe('#createAccountEntity', () => {
  test('should convert to entity', () => {
    const account = {
      maxRetention: 30,
      accountCode: 'someCode',
      domain: 'someDomain',
      automatedSegmentPurge: true,
      databaseCode: 'anotherCode',
      region: 'us-east',
      accountName: 'myAccount',
      maxRetentionConfirmed: false,
      archive: false,
      gateway: true,
      policyInheritance: true,
      passphrase: 'insecurePassword',
      type: 'mine',
      mailPlatform: 'google',
      packages: ['package0', 'package1'],
      mimecastId: 'someGUID',
      adminEmail: 'admin@mimecast.com',
      userCount: 10,
    } as Account;

    const entity = createAccountEntity(account);
    expect(entity).toEqual(
      expect.objectContaining({
        _key: account.mimecastId,
        _type: Entities.ACCOUNT._type,
        _class: Entities.ACCOUNT._class,
        name: account.accountName,
        displayName: account.accountName,
        accountCode: account.accountCode,
      }),
    );
  });
});
