export interface AlertCreateDTO {
  runId: string;
  rule: string;
  severity?: 'low' | 'medium' | 'high';
  details?: string;
}
