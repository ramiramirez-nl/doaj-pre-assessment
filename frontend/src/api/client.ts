import type { FormData, ReportResponse } from '../types/form.types';

export async function submitAssessment(
  formData: FormData
): Promise<ReportResponse> {
  const response = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) detail = body.error;
    } catch {
      // non-JSON error body — keep statusText
    }
    throw new Error(detail);
  }

  return response.json() as Promise<ReportResponse>;
}
