export interface AlertDTO {
  id?: string;
  runId: string;
  rule: string;
  severity?: 'low' | 'medium' | 'high';
}
