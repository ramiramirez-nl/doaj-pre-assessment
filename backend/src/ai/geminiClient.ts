import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

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
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  });

  const prompt = `You are a DOAJ (Directory of Open Access Journals) compliance checker.

Analyze the following webpage content and check if it meets this criterion:
CRITERION: ${input.criteria}
URL: ${input.url}

PAGE CONTENT (first 3000 chars):
${input.pageText.slice(0, 3000)}

Respond ONLY with valid JSON in this exact format:
{
  "found": true/false,
  "confidence": "high"/"medium"/"low",
  "evidence": "Quote or description of what you found (or did not find)",
  "issues": ["List of specific problems if any, empty array if none"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (Gemini may wrap in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        found: false,
        confidence: 'low',
        evidence: 'Could not parse AI response',
        issues: ['AI analysis failed'],
      };
    }
    return JSON.parse(jsonMatch[0]) as AnalysisResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const apiKey = process.env.GEMINI_API_KEY ?? '';
    const keyHint = apiKey ? `key set (len=${apiKey.length})` : 'GEMINI_API_KEY missing';
    return {
      found: false,
      confidence: 'low',
      evidence: `AI service error: ${message.slice(0, 300)} [${keyHint}]`,
      issues: [`AI check skipped: ${message.slice(0, 200)}`],
    };
  }
}
