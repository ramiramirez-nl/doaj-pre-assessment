import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

import { lookupIssn } from '../../src/issn/issnClient';

describe('lookupIssn', () => {
  it('returns valid true when ISSN exists at issn.org', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        '@graph': [{ 'mainTitle': 'Test Journal', 'identifier': '1234-5678' }],
      },
    });
    const result = await lookupIssn('1234-5678');
    expect(result.valid).toBe(true);
    expect(result.registeredTitle).toBe('Test Journal');
  });

  it('returns valid false when ISSN not found', async () => {
    (axios.get as any).mockResolvedValueOnce({ data: { '@graph': [] } });
    const result = await lookupIssn('0000-0000');
    expect(result.valid).toBe(false);
  });

  it('returns valid false on network error', async () => {
    (axios.get as any).mockRejectedValueOnce(new Error('Network error'));
    const result = await lookupIssn('9999-9999');
    expect(result.valid).toBe(false);
  });
});
