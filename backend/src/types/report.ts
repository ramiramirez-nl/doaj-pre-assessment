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
  warningCount: number;
  /** All results, including passes (for full report display) */
  items: ReportItem[];
  /** Backwards-compat: non-pass items only */
  issues: ReportItem[];
}
