import { describe, it, expect } from 'vitest';
import en from './en.json';
import tr from './tr.json';
import de from './de.json';
import es from './es.json';
import fr from './fr.json';
import ar from './ar.json';
import id from './id.json';
import zh from './zh.json';

const locales: Record<string, Record<string, string>> = { en, tr, de, es, fr, ar, id, zh };
const referenceKeys = new Set(Object.keys(en));

describe('i18n key parity', () => {
  for (const [lang, dict] of Object.entries(locales)) {
    it(`${lang}.json has the same keys as en.json`, () => {
      const keys = new Set(Object.keys(dict));
      const missing = [...referenceKeys].filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !referenceKeys.has(k));
      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    });
  }
});
