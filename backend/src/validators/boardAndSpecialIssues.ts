import type { EditorialData } from '../types/formData';
import type { ReportItem } from '../types/report';

const SECTION = 'Editorial';

/**
 * DOAJ Guide v2.9, "Quality control process": the editorial board should
 * have at least five members, and they should not all come from the same
 * institution. Both are "should" items, so shortfalls are warnings.
 */
export function checkBoardComposition(data: EditorialData): ReportItem[] {
  const results: ReportItem[] = [];
  const count = data.boardMemberCount;

  if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) {
    results.push({
      section: SECTION,
      field: 'boardMemberCount',
      status: 'warning',
      message: 'Editorial board size was not declared.',
      suggestion:
        'DOAJ expects an editorial board of at least five members with appropriate qualifications. Enter the number of board members listed on your website.',
    });
  } else if (count < 5) {
    results.push({
      section: SECTION,
      field: 'boardMemberCount',
      status: 'warning',
      message: `The editorial board has ${count} member(s), fewer than the five DOAJ expects.`,
      suggestion:
        'Expand the editorial board to at least five members with appropriate qualifications, and list them with their affiliations on the website.',
    });
  } else {
    results.push({
      section: SECTION,
      field: 'boardMemberCount',
      status: 'pass',
      message: `The editorial board has ${count} members (DOAJ expects at least five).`,
      suggestion: '',
    });
  }

  if (data.boardMultipleInstitutions === true) {
    results.push({
      section: SECTION,
      field: 'boardMultipleInstitutions',
      status: 'pass',
      message: 'Editorial board members come from more than one institution.',
      suggestion: '',
    });
  } else {
    results.push({
      section: SECTION,
      field: 'boardMultipleInstitutions',
      status: 'warning',
      message: 'It is not confirmed that board members come from more than one institution.',
      suggestion:
        'DOAJ expects that editorial board members do not all come from the same institution. Add members from other institutions and show each affiliation on the board page.',
    });
  }

  return results;
}

const OVERSIGHT_ITEMS: Array<{ key: keyof EditorialData; label: string }> = [
  { key: 'specialIssueEicResponsible', label: 'the editor-in-chief is responsible for special issues' },
  { key: 'specialIssueSameReview', label: 'special issue papers get the same editorial oversight and external peer review as regular papers' },
  { key: 'specialIssueLabelled', label: 'special issues are clearly labelled' },
  { key: 'guestEditorsVetted', label: "guest editors' credentials are checked and their work is overseen" },
  { key: 'guestEditorPapersIndependent', label: 'papers by guest editors are handled by an independent editor and reviewers' },
];

/**
 * DOAJ Guide v2.9, "Special issues". Applies only when the journal publishes
 * special issues. The 25% cap on guest-editor papers is checked as a hard
 * failure; the oversight conditions are reported together as one item.
 */
export function checkSpecialIssues(data: EditorialData): ReportItem[] {
  if (data.publishesSpecialIssues !== true) return [];
  const results: ReportItem[] = [];

  const missing = OVERSIGHT_ITEMS.filter(({ key }) => data[key] !== true);
  if (missing.length > 0) {
    results.push({
      section: SECTION,
      field: 'specialIssueOversight',
      status: 'warning',
      message: `Special issues: not confirmed that ${missing.map((m) => m.label).join('; ')}.`,
      suggestion:
        'DOAJ requires that special issues are under the editor-in-chief\'s responsibility, receive the same editorial oversight and external peer review as regular issues, are clearly labelled, and that guest editors are vetted and overseen. State this in a public special issues policy.',
    });
  } else {
    results.push({
      section: SECTION,
      field: 'specialIssueOversight',
      status: 'pass',
      message: 'Special issues are under editor-in-chief responsibility, peer reviewed, labelled, and guest editors are overseen.',
      suggestion: '',
    });
  }

  if (data.guestEditorPapersWithinLimit === true) {
    results.push({
      section: SECTION,
      field: 'guestEditorPapersWithinLimit',
      status: 'pass',
      message: 'Papers by guest editors make up no more than 25% of each special issue.',
      suggestion: '',
    });
  } else {
    results.push({
      section: SECTION,
      field: 'guestEditorPapersWithinLimit',
      status: 'fail',
      message: 'It is not confirmed that papers by guest editors are at most 25% of each special issue.',
      suggestion:
        'DOAJ caps papers authored by the guest editor(s) at 25% of the papers in a special issue. Limit guest-editor contributions and have them reviewed independently.',
    });
  }

  return results;
}
