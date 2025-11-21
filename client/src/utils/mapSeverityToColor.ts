export function mapSeverityToColor(sev: string) {
  switch (sev) {
    case 'low': return '#fbbf24';
    case 'medium': return '#f97316';
    case 'high': return '#ef4444';
    default: return '#6b7280';
  }
}

export default mapSeverityToColor;
