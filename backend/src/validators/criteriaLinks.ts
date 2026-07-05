/**
 * Maps report sections to the official DOAJ guidance page that explains the
 * underlying requirement. Section-level (not per-field) so links stay stable
 * when DOAJ reorganises page anchors.
 */
const SECTION_CRITERIA_URLS: Record<string, string> = {
  'Open Access': 'https://doaj.org/apply/guide/',
  About: 'https://doaj.org/apply/guide/',
  Copyright: 'https://doaj.org/apply/copyright-and-licensing/',
  Editorial: 'https://doaj.org/apply/transparency/',
  Ethics: 'https://doaj.org/apply/transparency/',
  'Business Model': 'https://doaj.org/apply/transparency/',
  'Best Practice': 'https://doaj.org/apply/seal/',
};

export function criteriaUrlFor(section: string): string | undefined {
  return SECTION_CRITERIA_URLS[section];
}
