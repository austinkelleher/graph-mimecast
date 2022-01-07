import { User } from '../../types';
import { Entities } from '../constants';
import { createUserEntity } from './converter';

describe('#createUserEntity', () => {
  test('should convert to entity', () => {
    const user = {
      name: 'Cloud Strife',
      emailAddress: 'cstrife@7thheaven.com',
      domain: '7thheaven.com',
      alias: false,
      addressType: 'agoodone',
      source: 'theplanet',
    } as User;

    const entity = createUserEntity(user);
    expect(entity).toEqual(
      expect.objectContaining({
        _key: user.emailAddress,
        _type: Entities.USER._type,
        _class: Entities.USER._class,
        username: user.emailAddress,
        name: user.name,
        displayName: user.name,
        emailDomain: [user.domain],
        email: user.emailAddress,
        alias: user.alias,
        addressType: user.addressType,
        source: user.source,
      }),
    );
  });
});
