import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const Steps = {
  AWARENESS_CAMPAIGNS: 'fetch-awareness-campaigns',
  AWARENESS_CAMPAIGNS_ENROLLMENT: 'fetch-awareness-campaigns-enrollment',
  ACCOUNT: 'fetch-account',
  DOMAINS: 'fetch-domains',
  USERS: 'fetch-users',
};

export const Entities: Record<
  'AWARENESS_CAMPAIGN' | 'ACCOUNT' | 'DOMAIN' | 'USER',
  StepEntityMetadata
> = {
  AWARENESS_CAMPAIGN: {
    resourceName: 'Awareness_Campaign',
    _type: 'mimecast_awareness_campaign',
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
  | 'ACCOUNT_HAS_DOMAIN'
  | 'DOMAIN_HAS_USER'
  | 'ACCOUNT_HAS_AWARENESS_CAMPAIGN'
  | 'USER_ASSIGNED_AWARENESS_CAMPAIGN'
  | 'USER_COMPLETED_AWARENESS_CAMPAIGN',
  StepRelationshipMetadata
> = {
  ACCOUNT_HAS_DOMAIN: {
    _type: 'mimecast_account_has_domain',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.DOMAIN._type,
  },
  ACCOUNT_HAS_AWARENESS_CAMPAIGN: {
    _type: 'mimecast_account_has_awareness_campaign',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.AWARENESS_CAMPAIGN._type,
  },
  DOMAIN_HAS_USER: {
    _type: 'mimecast_domain_has_user',
    sourceType: Entities.DOMAIN._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
  USER_ASSIGNED_AWARENESS_CAMPAIGN: {
    _type: 'mimecast_user_assigned_awareness_campaign',
    sourceType: Entities.USER._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: Entities.AWARENESS_CAMPAIGN._type,
  },
  USER_COMPLETED_AWARENESS_CAMPAIGN: {
    _type: 'mimecast_user_completed_awareness_campaign',
    sourceType: Entities.USER._type,
    _class: RelationshipClass.COMPLETED,
    targetType: Entities.AWARENESS_CAMPAIGN._type,
  },
};
