import { describe, it, expect } from 'vitest';
import { checkBoardComposition, checkSpecialIssues } from '../../src/validators/boardAndSpecialIssues';
import type { EditorialData } from '../../src/types/formData';

const base: EditorialData = {
  peerReviewTypes: ['Peer review'],
  peerReviewPolicyUrl: '',
  screensPlagiarism: true,
  plagiarismPolicyUrl: '',
  aimsAndScopeUrl: '',
  editorialBoardUrl: '',
  instructionsForAuthorsUrl: '',
  avgWeeksSubmissionToPublication: 10,
  endogenyCompliant: true,
  articleDatesDisplayed: true,
};

const statusOf = (items: { field: string; status: string }[], field: string) =>
  items.find((i) => i.field === field)?.status;

describe('checkBoardComposition', () => {
  it('warns when board size is not declared', () => {
    expect(statusOf(checkBoardComposition({ ...base, boardMemberCount: null }), 'boardMemberCount')).toBe('warning');
  });

  it('warns when the board has fewer than five members', () => {
    expect(statusOf(checkBoardComposition({ ...base, boardMemberCount: 4 }), 'boardMemberCount')).toBe('warning');
  });

  it('passes with five members from several institutions', () => {
    const items = checkBoardComposition({ ...base, boardMemberCount: 5, boardMultipleInstitutions: true });
    expect(statusOf(items, 'boardMemberCount')).toBe('pass');
    expect(statusOf(items, 'boardMultipleInstitutions')).toBe('pass');
  });

  it('warns when institutional spread is not confirmed', () => {
    expect(statusOf(checkBoardComposition({ ...base, boardMemberCount: 8 }), 'boardMultipleInstitutions')).toBe('warning');
  });
});

describe('checkSpecialIssues', () => {
  const allMet: Partial<EditorialData> = {
    publishesSpecialIssues: true,
    specialIssueEicResponsible: true,
    specialIssueSameReview: true,
    specialIssueLabelled: true,
    guestEditorsVetted: true,
    guestEditorPapersIndependent: true,
    guestEditorPapersWithinLimit: true,
  };

  it('returns nothing when the journal does not publish special issues', () => {
    expect(checkSpecialIssues({ ...base, publishesSpecialIssues: false })).toEqual([]);
    expect(checkSpecialIssues(base)).toEqual([]);
  });

  it('passes when every condition is confirmed', () => {
    const items = checkSpecialIssues({ ...base, ...allMet });
    expect(items.every((i) => i.status === 'pass')).toBe(true);
  });

  it('fails when the 25% guest-editor limit is not met', () => {
    const items = checkSpecialIssues({ ...base, ...allMet, guestEditorPapersWithinLimit: false });
    expect(statusOf(items, 'guestEditorPapersWithinLimit')).toBe('fail');
  });

  it('warns and names the unconfirmed oversight conditions', () => {
    const items = checkSpecialIssues({ ...base, ...allMet, specialIssueLabelled: false });
    const oversight = items.find((i) => i.field === 'specialIssueOversight');
    expect(oversight?.status).toBe('warning');
    expect(oversight?.message).toContain('clearly labelled');
  });
});
