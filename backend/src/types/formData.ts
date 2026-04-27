export interface ApcFee {
  currency: string;
  amount: number;
}

export interface OpenAccessData {
  adheresToDefinition: boolean;
  openAccessStatementUrl: string;
  licenseStartDate: string;
}

export interface AboutData {
  journalTitle: string;
  alternativeTitle: string;
  homepageUrl: string;
  issnPrint: string;
  issnOnline: string;
  keywords: string[];
  languages: string[];
  publisherName: string;
  publisherCountry: string;
}

export interface CopyrightData {
  licenses: string[];
  licenseInfoUrl: string;
  embedsLicenseInArticles: boolean;
  authorsRetainCopyright: boolean;
  copyrightTermsUrl: string;
}

export interface EditorialData {
  peerReviewTypes: string[];
  peerReviewPolicyUrl: string;
  screensPlagiarism: boolean;
  plagiarismPolicyUrl: string;
  aimsAndScopeUrl: string;
  editorialBoardUrl: string;
  instructionsForAuthorsUrl: string;
  avgWeeksSubmissionToPublication: number;
}

export interface BusinessModelData {
  chargesApc: boolean;
  apcFees: ApcFee[];
  apcInfoUrl: string;
  providesWaiver: boolean;
  chargesOtherFees: boolean;
}

export interface BestPracticeData {
  archivingServices: string[];
  repositoryPolicies: string[];
  persistentIdentifiers: string[];
}

export interface FormData {
  openAccess: OpenAccessData;
  about: AboutData;
  copyright: CopyrightData;
  editorial: EditorialData;
  businessModel: BusinessModelData;
  bestPractice: BestPracticeData;
}
