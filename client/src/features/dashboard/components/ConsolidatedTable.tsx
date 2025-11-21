import React from 'react';
import formatDate from '../../../utils/formatDate';

export default function ConsolidatedTable({ rows }: { rows: Array<Record<string, any>> }) {
  if (!rows || rows.length === 0) return <div className="card muted">No items</div>;
  const keys = Object.keys(rows[0]);
  return (
    <div className="card" style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)' }}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
              {keys.map((k) => (
                <td key={k} style={{ padding: '10px 12px' }}>{k.toLowerCase().includes('date') ? formatDate(r[k]) : String(r[k])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
