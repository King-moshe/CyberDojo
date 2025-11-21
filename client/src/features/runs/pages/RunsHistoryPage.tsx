import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { getRuns } from '../../../api/runsApi';
import { Run } from '../../../types/api';
import formatDate from '../../../utils/formatDate';

function StatusBadge({ status }: { status: string }) {
  const color = status === 'running' ? '#f59e0b' : status === 'completed' ? '#10b981' : status === 'failed' ? '#ef4444' : '#6b7280';
  return (
    <span style={{ padding: '6px 8px', borderRadius: 8, background: color, color: '#fff', fontWeight: 700, fontSize: 12, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

export default function RunsHistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    getRuns().then(setRuns).catch(() => setRuns([]));
  }, []);

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>Runs</h2>
          <div className="muted">Recent scenario executions</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {runs.length === 0 && <div className="card muted">No runs yet.</div>}

        {runs.map((r) => (
          <div key={r._id || r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(79,156,255,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                { (r._id || r.id || '').toString().slice(0,4) }
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link to={`/runs/${r._id || r.id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>{r._id || r.id}</Link>
                  <span className="muted">•</span>
                  <span className="muted">Scenario: {typeof r.scenario === 'string' ? r.scenario : String((r.scenario as any).name ?? r.scenario)}</span>
                </div>
                <div className="muted" style={{ fontSize: 13 }}>{formatDate((r as any).createdAt || (r as any).startedAt)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <StatusBadge status={r.status} />
              <Link to={`/runs/${r._id || r.id}`} className="btn btn-ghost">View</Link>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
