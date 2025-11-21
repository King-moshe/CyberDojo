import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { getRun } from '../../../api/runsApi';
import RunLogsViewer from '../components/RunLogsViewer';
import { Run } from '../../../types/api';

export default function RunDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [parsedLogs, setParsedLogs] = useState<any[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const [sseStatus, setSseStatus] = useState<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRun(id)
      .then((r) => {
        setRun(r);
        const initialLogs = r?.logs || [];
        setLogs(initialLogs);
        try {
          const parsed = initialLogs.map((l: string) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
          setParsedLogs(parsed as any[]);
        } catch (_) {
          setParsedLogs([]);
        }
      })
      .catch(() => {
        setRun(null);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Connect to SSE stream for live logs
    const url = `/api/runs/${id}/stream`;
    try {
      setSseStatus('connecting');
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => setSseStatus('open');

      es.onmessage = (e) => {
        // Try to parse JSON payloads, fallback to raw string
        let text = e.data;
        try {
          const parsed = JSON.parse(e.data);
          if (typeof parsed === 'string') text = parsed;
          else if (parsed && (parsed.log || parsed.message)) text = parsed.log || parsed.message;
          else text = JSON.stringify(parsed);
        } catch (_) {
          // not JSON, keep raw
        }
        setLogs((prev) => {
          const next = [...prev, text];
          // update parsedLogs as well
          try {
            const maybe = JSON.parse(text);
            setParsedLogs((p) => [...p, maybe]);
          } catch (_) {
            // ignore
          }
          return next;
        });
      };

      es.onerror = (_err) => {
        setSseStatus('error');
        // if closed, cleanup
        if (es.readyState === EventSource.CLOSED) {
          try { es.close(); } catch (_) {}
          esRef.current = null;
          setSseStatus('closed');
        }
      };

      return () => {
        try { es.close(); } catch (_) {}
        esRef.current = null;
        setSseStatus('closed');
      };
    } catch (e) {
      console.warn('SSE not available', e);
      setSseStatus('error');
    }
  }, [id]);

  return (
    <MainLayout>
      <h2>Run Details</h2>
      {loading && <div>Loading run...</div>}
      {!loading && !run && <div>Run not found.</div>}
      {run && (
        <div>
          <div style={{ marginBottom: 8 }}>
            <strong>Run ID:</strong> {run._id || run.id}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Status:</strong> {run.status}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 6, background: sseStatus === 'open' ? 'green' : sseStatus === 'connecting' ? 'orange' : sseStatus === 'error' ? 'red' : '#888' }} />
              <small>SSE: {sseStatus}</small>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Step Timeline</strong>
              <div style={{ marginTop: 8 }}>
                {parsedLogs.length === 0 && <div style={{ fontSize: 12, color: '#666' }}>No structured step logs yet.</div>}
                {parsedLogs.map((pl, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <div style={{ width: 28, textAlign: 'center' }}>{pl.stepIndex ?? idx}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{pl.type}</div>
                      <div style={{ fontSize: 12, color: '#444' }}>{pl.message || (pl.details && String(pl.details))}</div>
                    </div>
                    <div>
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: pl.status === 'success' ? '#e6ffed' : pl.status === 'failed' ? '#ffe6e6' : '#fff4e6', color: '#222', fontSize: 12 }}>
                        {pl.status}
                      </span>
                    </div>
                    <div style={{ width: 80, textAlign: 'right', fontSize: 12, color: '#666' }}>{pl.mode}</div>
                  </div>
                ))}
              </div>
            </div>
            <RunLogsViewer logs={logs} autoScroll />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
