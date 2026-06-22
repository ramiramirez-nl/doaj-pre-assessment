import { describe, it, expect } from 'vitest';
import { validateBestPractice } from '../../src/validators/bestPractice';

describe('validateBestPractice', () => {
  it('warns if no archiving services are used', async () => {
    const results = await validateBestPractice({
      archivingServices: [],
      repositoryPolicies: [],
      persistentIdentifiers: [],
      articlesHaveDois: false
    });

    const archResult = results.find(r => r.field === 'archivingServices');
    expect(archResult?.status).toBe('warning');
  });

  it('passes if recognised archiving service is used', async () => {
    const results = await validateBestPractice({
      archivingServices: ['CLOCKSS'],
      repositoryPolicies: ['Institutional'],
      persistentIdentifiers: ['DOI'],
      articlesHaveDois: true
    });

    const archResult = results.find(r => r.field === 'archivingServices');
    expect(archResult?.status).toBe('pass');
  });
});
