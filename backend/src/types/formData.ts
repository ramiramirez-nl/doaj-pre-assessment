export interface ApcFee {
  currency: string;
  amount: number;
}

export interface OpenAccessData {
  adheresToDefinition: boolean;
  hasNoEmbargo: boolean;
  openAccessStatementUrl: string;
  licenseStartDate: string;
}

export interface AboutData {
  journalTitle: string;
  homepageUrl: string;
  issnPrint: string;
  issnOnline: string;
}

export interface CopyrightData {
  licenses: string[];
  licenseInfoUrl: string;
  embedsLicenseInArticles: boolean;
  authorsRetainCopyright: boolean;
  copyrightTermsUrl: string;
  licenseConsistentOnArticlePages: boolean;
  licenseConsistentInPdfs: boolean;
  noCopyrightConflicts: boolean;
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
  endogenyCompliant: boolean;
  articleDatesDisplayed: boolean;
}

export interface EthicsData {
  publicationEthicsUrl: string;
  hasRetractionsPolicy: boolean;
  hasConflictPolicy: boolean;
  noMisleadingMetrics: boolean;
  indexingClaimsVerifiable: boolean;
}

export interface BusinessModelData {
  chargesApc: boolean;
  apcFees: ApcFee[];
  apcInfoUrl: string;
  providesWaiver: boolean;
  chargesOtherFees: boolean;
  otherFeesInfoUrl: string;
}

export interface BestPracticeData {
  archivingServices: string[];
  repositoryPolicies: string[];
  persistentIdentifiers: string[];
  articlesHaveDois: boolean;
}

export interface FormData {
  openAccess: OpenAccessData;
  about: AboutData;
  copyright: CopyrightData;
  editorial: EditorialData;
  ethics: EthicsData;
  businessModel: BusinessModelData;
  bestPractice: BestPracticeData;
}
