export type CheckStatus = 'pass' | 'fail' | 'warning';
export type OverallStatus = 'pass' | 'fail' | 'warning';

export interface ReportItem {
  section: string;
  field: string;
  status: CheckStatus;
  message: string;
  suggestion: string;
  url?: string;
}

export interface ReportResponse {
  overallStatus: OverallStatus;
  passCount: number;
  failCount: number;
  issues: ReportItem[];
}
