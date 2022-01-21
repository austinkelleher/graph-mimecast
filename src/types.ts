// Providers often supply types with their API libraries.

interface AllOtherCampaigns {
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
  forQuestion4?: number;
  forQuestion3?: number;
  forQuestion2?: number;
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

interface MimecastError {
  code: string;
  message: string;
  retryable: boolean;
}

interface Template {
  id: string;
  displayTitle: string;
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

// paginate-able
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

export interface AwarenessCampaignResponse {
  campaigns: AwarenessCampaign[];
}

export interface AwarenessCampaign {
  percentCorrect: number;
  percentComplete: number;
  locked: boolean;
  numCorrectAnswers: CorrectAnswers;
  id: string;
  numCompleted: number;
  allOtherCampaigns: AllOtherCampaigns;
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

// paginate-able
export interface AwarenessCampaignUserDataResponse {
  items: AwarenessCampaignUserData[];
}

export interface AwarenessCampaignUserData {
  name: string;
  email: string;
  department: string;
  results: {
    forQuestion1: string;
    forQuestion2?: string;
    forQuestion3?: string;
    forQuestion4?: string;
  };
  acknowledgement: boolean;
  userState: string;
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
  fail?: [
    {
      errors: MimecastError[];
    },
  ];
}

/**
 * Phishing Campaigns do not appear to be functional in Mimecast despite having api docs.
 * We can add ingestion support after feature is confirmed working.
 */
export interface PhishingCampaign {
  id: string;
  name: string;
  templates: Template[];
  landingPage: {
    id: string;
    name: string;
  };
  group: Group;
  launchDate: string;
  locale: string;
  timeSlotSelected: string;
  sender: {
    name: string;
    email: string;
  };
  numSubmitted: number;
  numOpened: number;
  numClicked: number;
  numSent: number;
  numReported: number;
  locked: boolean;
}

// paginate-able
export interface PhishingCampaignUserDataResponse {
  items: PhishingCampaignUserData[];
}

export interface PhishingCampaignUserData {
  name: string;
  email: string;
  templateName: string;
  department: string;
  status: string;
  numCampaignsSent: number;
  numCampaignsClicked: number;
  numTrainingModulesAssigned: number;
  numCorrectAnswers: number;
  numIncorrectAnswers: number;
  userState: string;
}
