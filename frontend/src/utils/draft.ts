import type { FormData } from '../types/form.types';

const DRAFT_KEY = 'doaj-preassessment-draft-v1';

export function loadDraft(defaults: FormData): FormData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FormData>;
    if (!parsed || typeof parsed !== 'object' || !parsed.about) return null;
    return {
      openAccess: { ...defaults.openAccess, ...parsed.openAccess },
      about: { ...defaults.about, ...parsed.about },
      copyright: { ...defaults.copyright, ...parsed.copyright },
      editorial: { ...defaults.editorial, ...parsed.editorial },
      ethics: { ...defaults.ethics, ...parsed.ethics },
      businessModel: { ...defaults.businessModel, ...parsed.businessModel },
      bestPractice: { ...defaults.bestPractice, ...parsed.bestPractice },
    };
  } catch {
    return null;
  }
}

export function saveDraft(values: unknown): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // localStorage full or unavailable — drafts are best-effort
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
