import React from 'react';
import { Alert } from '../../../types/api';

export default function AlertList({ alerts }: { alerts: Alert[] }) {
  return (
    <div>
      {alerts.map((a) => (
        <div key={a._id || a.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
          <strong>{(a as any).rule}</strong> — <span>{a.severity}</span>
          <div style={{ fontSize: 12 }}>{a.details}</div>
        </div>
      ))}
    </div>
  );
}
