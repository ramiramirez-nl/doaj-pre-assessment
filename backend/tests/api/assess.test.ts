import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../src/validators/index', () => ({
  runAllValidations: vi.fn().mockResolvedValue({
    overallStatus: 'fail',
    passCount: 5,
    failCount: 2,
    issues: [
      {
        section: 'Open Access',
        field: 'openAccessStatementUrl',
        status: 'fail',
        message: 'Page not accessible',
        suggestion: 'Fix the URL',
      },
    ],
  }),
}));

import app from '../../src/index';

describe('POST /api/assess', () => {
  it('returns 200 with report on valid form data', async () => {
    const formData = {
      openAccess: {
        adheresToDefinition: true,
        openAccessStatementUrl: 'https://example.com/oa',
        licenseStartDate: '2023-01',
      },
      about: {
        journalTitle: 'Test Journal',
        alternativeTitle: '',
        homepageUrl: 'https://example.com',
        issnPrint: '',
        issnOnline: '1234-5678',
        keywords: ['engineering'],
        languages: ['English'],
        publisherName: 'Test Publisher',
        publisherCountry: 'Turkey',
      },
      copyright: {
        licenses: ['CC BY'],
        licenseInfoUrl: 'https://example.com/license',
        embedsLicenseInArticles: false,
        authorsRetainCopyright: true,
        copyrightTermsUrl: 'https://example.com/copyright',
      },
      editorial: {
        peerReviewTypes: ['Double anonymous peer review'],
        peerReviewPolicyUrl: 'https://example.com/peer-review',
        screensPlagiarism: true,
        plagiarismPolicyUrl: 'https://example.com/plagiarism',
        aimsAndScopeUrl: 'https://example.com/aims',
        editorialBoardUrl: 'https://example.com/board',
        instructionsForAuthorsUrl: 'https://example.com/instructions',
        avgWeeksSubmissionToPublication: 12,
      },
      businessModel: {
        chargesApc: false,
        apcFees: [],
        apcInfoUrl: '',
        providesWaiver: false,
        chargesOtherFees: false,
      },
      bestPractice: {
        archivingServices: [],
        repositoryPolicies: [],
        persistentIdentifiers: ['DOIs'],
      },
    };

    const res = await request(app).post('/api/assess').send(formData);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('overallStatus');
    expect(res.body).toHaveProperty('issues');
    expect(Array.isArray(res.body.issues)).toBe(true);
  });

  it('returns 400 on missing form data', async () => {
    const res = await request(app).post('/api/assess').send({});
    expect(res.status).toBe(400);
  });
});
