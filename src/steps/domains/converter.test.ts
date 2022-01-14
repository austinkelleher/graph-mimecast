import { Domain } from '../../types';
import { Entities } from '../constants';
import { createDomainEntity } from './converter';

describe('#createDomainEntity', () => {
  test('should convert to entity', () => {
    const domain = {
      id: 'someId',
      domain: 'myDomain',
      sendOnly: true,
      local: false,
      inboundType: 'yes',
    } as Domain;

    const entity = createDomainEntity(domain);
    expect(entity).toEqual(
      expect.objectContaining({
        _key: domain.id,
        _type: Entities.DOMAIN._type,
        _class: Entities.DOMAIN._class,
        domainName: domain.domain,
        name: domain.domain,
        displayName: domain.domain,
        sendOnly: domain.sendOnly,
        local: domain.local,
        inboundType: domain.inboundType,
      }),
    );
  });
});
