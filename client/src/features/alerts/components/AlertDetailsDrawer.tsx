import React from 'react';
import { Alert } from '../../../types/api';

export default function AlertDetailsDrawer({ alert }: { alert?: Alert }) {
  if (!alert) return null;
  return (
    <aside style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 360, background: '#fff', boxShadow: '-2px 0 8px rgba(0,0,0,0.08)', padding: 12 }}>
      <h3>{alert.rule}</h3>
      <div>Severity: {alert.severity}</div>
      <div>{alert.details}</div>
    </aside>
  );
}
