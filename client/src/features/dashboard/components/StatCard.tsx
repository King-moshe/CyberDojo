import React from 'react';

export default function StatCard({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="card" style={{ padding: 16, minWidth: 160 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
      {hint && <div className="muted" style={{ marginTop: 8 }}>{hint}</div>}
    </div>
  );
}
