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
    throw new Error(`Assessment failed: ${response.statusText}`);
  }

  return response.json() as Promise<ReportResponse>;
}
