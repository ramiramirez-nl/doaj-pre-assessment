import { z } from 'zod';

/**
 * Runtime validation for POST /api/assess bodies.
 *
 * Mirrors the interfaces in ../types/formData. openAccess, about, and
 * editorial are required (same 400 behavior as before); the remaining
 * sections default to empty objects so partially filled forms still assess.
 * Tri-state booleans (yes / no / unanswered) stay optional because several
 * validators treat `false` and `undefined` differently.
 */

const urlField = z.string().trim().max(2000).default('');
const shortText = z.string().trim().max(500).default('');
const chipArray = z.array(z.string().trim().max(200)).max(50).default([]);
const triStateBool = z.boolean().optional();

const openAccessSchema = z.object({
  adheresToDefinition: z.boolean().default(false),
  hasNoEmbargo: z.boolean().default(false),
  openAccessStatementUrl: urlField,
  licenseStartDate: shortText,
});

const aboutSchema = z.object({
  journalTitle: shortText,
  homepageUrl: urlField,
  issnPrint: z.string().trim().max(20).default(''),
  issnOnline: z.string().trim().max(20).default(''),
});

const copyrightSchema = z.object({
  licenses: chipArray,
  licenseInfoUrl: urlField,
  embedsLicenseInArticles: triStateBool,
  authorsRetainCopyright: triStateBool,
  copyrightTermsUrl: urlField,
  licenseConsistentOnArticlePages: triStateBool,
  licenseConsistentInPdfs: triStateBool,
  noCopyrightConflicts: triStateBool,
});

const editorialSchema = z.object({
  peerReviewTypes: chipArray,
  peerReviewPolicyUrl: urlField,
  screensPlagiarism: triStateBool,
  plagiarismPolicyUrl: urlField,
  aimsAndScopeUrl: urlField,
  editorialBoardUrl: urlField,
  instructionsForAuthorsUrl: urlField,
  avgWeeksSubmissionToPublication: z.number().min(0).max(520).optional(),
  endogenyCompliant: triStateBool,
  articleDatesDisplayed: triStateBool,
});

const ethicsSchema = z.object({
  publicationEthicsUrl: urlField,
  hasRetractionsPolicy: triStateBool,
  hasConflictPolicy: triStateBool,
  noMisleadingMetrics: triStateBool,
  indexingClaimsVerifiable: triStateBool,
});

const apcFeeSchema = z.object({
  currency: z.string().trim().max(10).default(''),
  amount: z.number().min(0).default(0),
});

const businessModelSchema = z.object({
  chargesApc: triStateBool,
  apcFees: z.array(apcFeeSchema).max(20).default([]),
  apcInfoUrl: urlField,
  providesWaiver: triStateBool,
  chargesOtherFees: triStateBool,
  otherFeesInfoUrl: urlField,
});

const bestPracticeSchema = z.object({
  archivingServices: chipArray,
  repositoryPolicies: chipArray,
  persistentIdentifiers: chipArray,
  articlesHaveDois: z.boolean().default(false),
});

export const assessRequestSchema = z.object({
  openAccess: openAccessSchema,
  about: aboutSchema,
  editorial: editorialSchema,
  copyright: copyrightSchema.prefault({}),
  ethics: ethicsSchema.prefault({}),
  businessModel: businessModelSchema.prefault({}),
  bestPractice: bestPracticeSchema.prefault({}),
  language: z.string().trim().max(10).optional(),
});

export type AssessRequest = z.infer<typeof assessRequestSchema>;
