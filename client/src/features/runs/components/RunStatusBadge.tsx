import React from 'react';

export default function RunStatusBadge({ status }: { status: string }) {
  const color = status === 'running' ? '#f59e0b' : status === 'completed' ? '#10b981' : '#6b7280';
  return <span style={{ padding: '4px 8px', background: color, color: '#fff', borderRadius: 6 }}>{status}</span>;
}
