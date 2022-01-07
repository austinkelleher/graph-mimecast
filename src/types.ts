// Providers often supply types with their API libraries.

interface AllOtherCampagins {
  numCorrectAnswers: number;
  numCampaigns: number;
  numComplete: number;
  numSent: number;
}

interface Group {
  description: string;
  source: string;
  folderCount: number;
  parentId: string;
  id: string;
  userCount: number;
}

interface CorrectAnswers {
  forQuestion3: number;
  forQuestion2: number;
  forQuestion1: number;
}

interface Title {
  defaultGifs: {
    correctGif: string;
    incorrectGif: string;
  };
  titleForCustomModule: boolean;
  correctAnswers: CorrectAnswers;
  id: string;
  title: string;
}

export interface Campaign {
  percentCorrect: number;
  percentComplete: number;
  locked: boolean;
  numCorrectAnswers: CorrectAnswers;
  id: string;
  numCompleted: number;
  allOtherCampagins: AllOtherCampagins;
  group: Group;
  name: string;
  title: Title;
  createDate: string;
  numSent: number;
  emailCustomized: boolean;
  launchDate: string;
  emailMsg: {
    body: string;
    subject: string;
  };
}

export interface Account {
  maxRetention: number;
  accountCode: string;
  domain: string;
  automatedSegmentPurge: boolean;
  databaseCode: string;
  supportCode: string;
  region: string;
  accountName: string;
  maxRetentionConfirmed: boolean;
  archive: boolean;
  gateway: boolean;
  policyInheritance: boolean;
  passphrase: string;
  type: string;
  mailPlatform: string;
  packages: string[];
  mimecastId: string;
  adminEmail: string;
  userCount: number;
}

export interface UserResponse {
  users: User[];
  userCount: number;
}

export interface User {
  name: string;
  emailAddress: string;
  domain: string;
  alias: boolean;
  addressType: string;
  source: string;
}

export interface Domain {
  id: string;
  domain: string;
  sendOnly: boolean;
  local: boolean;
  inboundType: string;
}

export interface ApiResponse<T> {
  data: T[];
  meta: {
    status: number;
    pagination?: {
      pageSize: number;
      totalCount: number;
      recordStart?: number;
      next?: string;
      previous?: string;
    };
  };
  fail?: any[];
}
