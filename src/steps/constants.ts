import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const Steps = {
  CAMPAIGNS: 'fetch-campaigns',
  ACCOUNT: 'fetch-account',
  DOMAINS: 'fetch-domains',
  USERS: 'fetch-users',
};

export const Entities: Record<
  'CAMPAIGN' | 'ACCOUNT' | 'DOMAIN' | 'USER',
  StepEntityMetadata
> = {
  CAMPAIGN: {
    resourceName: 'Campaign',
    _type: 'mimecast_campaign',
    _class: ['Training'],
  },
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'mimecast_account',
    _class: ['Account'],
  },
  DOMAIN: {
    resourceName: 'Domain',
    _type: 'mimecast_domain',
    _class: ['Domain'],
  },
  USER: {
    resourceName: 'User',
    _type: 'mimecast_user',
    _class: ['User'],
  },
};

export const Relationships: Record<
  'ACCOUNT_HAS_DOMAIN' | 'DOMAIN_HAS_USER',
  StepRelationshipMetadata
> = {
  ACCOUNT_HAS_DOMAIN: {
    _type: 'mimecast_account_has_domain',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.DOMAIN._type,
  },
  DOMAIN_HAS_USER: {
    _type: 'mimecast_domain_has_user',
    sourceType: Entities.DOMAIN._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
};
