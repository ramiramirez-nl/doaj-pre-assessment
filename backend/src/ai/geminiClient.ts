import axios from 'axios';

/**
 * AI client. OpenAI-compatible REST API.
 * Defaults to freemodel.dev free models, but works with any OpenAI-compatible
 * endpoint (set OPENAI_BASE_URL + OPENAI_API_KEY).
 *
 * Env vars:
 *  - OPENAI_API_KEY   (required)
 *  - OPENAI_BASE_URL  (default https://api.freemodel.dev/v1)
 *  - AI_MODEL         (default gpt-5.4-mini)
 *
 * Legacy fallback: GEMINI_API_KEY still read so existing deployments keep working
 * (treated as OPENAI_API_KEY if OPENAI_API_KEY missing).
 */

const BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://api.freemodel.dev/v1';
const MODEL = process.env.AI_MODEL ?? 'gpt-5.4-mini';
const API_KEY = process.env.OPENAI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';

export interface AnalysisInput {
  pageText: string;
  criteria: string;
  url: string;
}

export interface AnalysisResult {
  found: boolean;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
  issues: string[];
}

export async function analyzePageContent(
  input: AnalysisInput
): Promise<AnalysisResult> {
  const prompt = `You are a DOAJ (Directory of Open Access Journals) compliance checker.

Analyze the following webpage content and check if it meets this criterion:
CRITERION: ${input.criteria}
URL: ${input.url}

PAGE CONTENT (first 3000 chars):
${input.pageText.slice(0, 3000)}

Respond ONLY with valid JSON in this exact format, no markdown fences:
{
  "found": true/false,
  "confidence": "high"/"medium"/"low",
  "evidence": "Quote or description of what you found (or did not find)",
  "issues": ["List of specific problems if any, empty array if none"]
}`;

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        timeout: 30000,
      }
    );

    const text: string =
      response.data?.choices?.[0]?.message?.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        found: false,
        confidence: 'low',
        evidence: `Could not parse AI response: ${text.slice(0, 200)}`,
        issues: ['AI analysis failed'],
      };
    }
    return JSON.parse(jsonMatch[0]) as AnalysisResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const keyHint = API_KEY
      ? `key set (len=${API_KEY.length})`
      : 'OPENAI_API_KEY missing';
    return {
      found: false,
      confidence: 'low',
      evidence: `AI service error: ${message.slice(0, 300)} [${keyHint}, model=${MODEL}]`,
      issues: [`AI check skipped: ${message.slice(0, 200)}`],
    };
  }
}
