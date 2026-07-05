import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

const mockReport = {
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
};

vi.mock('../../src/validators/index', () => ({
  SECTION_NAMES: [
    'Open Access',
    'About',
    'Editorial',
    'Copyright',
    'Ethics',
    'Business Model',
    'Best Practice',
  ],
  runAllValidations: vi
    .fn()
    .mockImplementation(
      async (
        _formData: unknown,
        _language: unknown,
        onSection?: (r: { section: string; index: number; items: unknown[] }) => void
      ) => {
        onSection?.({ section: 'Open Access', index: 0, items: [] });
        return mockReport;
      }
    ),
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

  it('streams start, section, and done events when Accept is text/event-stream', async () => {
    const formData = {
      openAccess: {
        adheresToDefinition: true,
        openAccessStatementUrl: 'https://example.com/oa',
        licenseStartDate: '2023-01',
      },
      about: {
        journalTitle: 'Test Journal',
        homepageUrl: 'https://example.com',
        issnPrint: '',
        issnOnline: '1234-5678',
      },
      editorial: {
        peerReviewTypes: ['Double anonymous peer review'],
        peerReviewPolicyUrl: 'https://example.com/peer-review',
      },
    };

    const res = await request(app)
      .post('/api/assess')
      .set('Accept', 'text/event-stream')
      .send(formData)
      .buffer(true)
      .parse((response, callback) => {
        let data = '';
        response.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        response.on('end', () => callback(null, data));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    const body = res.body as string;
    expect(body).toContain('event: start');
    expect(body).toContain('event: section');
    expect(body).toContain('event: done');
    expect(body).toContain('"overallStatus":"fail"');
  });
});
