import axios from 'axios';

export interface IssnLookupResult {
  valid: boolean;
  registeredTitle: string;
  issn: string;
}

export async function lookupIssn(issn: string): Promise<IssnLookupResult> {
  const cleanIssn = issn.replace(/[^0-9X-]/gi, '').toUpperCase();
  try {
    const url = `https://portal.issn.org/resource/ISSN/${cleanIssn}?format=json`;
    const response = await axios.get(url, { timeout: 8000 });
    const graph: any[] = response.data?.['@graph'] ?? [];
    if (graph.length === 0) {
      return { valid: false, registeredTitle: '', issn: cleanIssn };
    }
    const entry = graph.find((g) => g['mainTitle']) ?? graph[0];
    return {
      valid: true,
      registeredTitle: entry['mainTitle'] ?? '',
      issn: cleanIssn,
    };
  } catch {
    return { valid: false, registeredTitle: '', issn: cleanIssn };
  }
}
