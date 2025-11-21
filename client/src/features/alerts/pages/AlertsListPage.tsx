import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { listAlerts, resolveAlert as apiResolve, subscribeAlertsStream } from '../../../api/alertsApi';
import type { Alert } from '../../../types/api';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import { useToast } from '../../../components/common/ToastProvider';
import { mapSeverityToColor } from '../../../utils/mapSeverityToColor';
import { useNavigate } from 'react-router-dom';
import formatDate from '../../../utils/formatDate';

export default function AlertsListPage() {
  const [data, setData] = useState<{ results: Alert[]; total: number; page: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'reconnecting' | 'failed'>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await listAlerts({ page, limit });
      setData(res as any);
    } catch (e) {
      console.error(e);
      toast.show('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page]);

  // subscribe to server-sent events for new alerts with retry/backoff and show status/countdown
  useEffect(() => {
    // helper to start countdown in seconds
    const startCountdown = (seconds: number) => {
      setCountdown(seconds);
      // clear previous
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      const id = window.setInterval(() => {
        setCountdown((c) => {
          if (c === null) return null;
          if (c <= 1) {
            window.clearInterval(id);
            countdownRef.current = null;
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      countdownRef.current = id;
    };

    const unsub = subscribeAlertsStream(
      (alert) => {
        toast.show(`New alert: ${alert.type} (${alert.severity})`, 'info');
        setData((prev) => {
          if (!prev) return { results: [alert], total: 1, page: 1, limit };
          return { ...prev, results: [alert, ...prev.results], total: prev.total + 1 };
        });
      },
      (err) => {
        console.warn('alerts SSE error', err);
        setConnectionStatus('failed');
        // clear countdown
        if (countdownRef.current) { window.clearInterval(countdownRef.current); countdownRef.current = null; }
        setCountdown(null);
      },
      () => {
        setConnectionStatus('connected');
        // clear any countdown
        if (countdownRef.current) { window.clearInterval(countdownRef.current); countdownRef.current = null; }
        setCountdown(null);
      },
      (delayMs, attempt) => {
        setConnectionStatus('reconnecting');
        const secs = Math.ceil(delayMs / 1000);
        startCountdown(secs);
      },
      (status) => {
        setConnectionStatus(status);
        if (status !== 'reconnecting') {
          if (countdownRef.current) { window.clearInterval(countdownRef.current); countdownRef.current = null; }
          setCountdown(null);
        }
      }
    );

    return () => {
      unsub();
      if (countdownRef.current) { window.clearInterval(countdownRef.current); countdownRef.current = null; }
    };
  }, []);

  const onResolve = async (id: string) => {
    try {
      await apiResolve(id);
      toast.show('Alert resolved', 'success');
      fetch();
    } catch (e) {
      console.error(e);
      toast.show('Failed to resolve alert', 'error');
    }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Alerts
            {connectionStatus === 'connected' && (
              <span style={{ background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>LIVE</span>
            )}
            {connectionStatus === 'reconnecting' && (
              <span style={{ background: '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>
                RECONNECTING{countdown !== null ? ` in ${countdown}s` : ''}
              </span>
            )}
            {connectionStatus === 'failed' && (
              <span style={{ background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>DISCONNECTED</span>
            )}
        </h2>
      </div>

      <Card>
        {loading && <Spinner />}
        {!loading && !data && <div>No alerts</div>}

        {!loading && data && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Scenario</th>
                  <th>Run</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((a) => (
                  <tr key={a._id} style={{ borderBottom: '1px solid #f6f6f6' }}>
                    <td><span style={{ padding: '4px 8px', borderRadius: 6, background: mapSeverityToColor(a.severity), color: '#fff' }}>{a.severity}</span></td>
                    <td>{a.type}</td>
                    <td style={{ maxWidth: 320 }}>{a.message}</td>
                    <td>{a.scenarioId ? <a onClick={() => navigate(`/scenarios/${a.scenarioId}`)}>{a.scenarioId}</a> : '-'}</td>
                    <td>{a.runId ? <a onClick={() => navigate(`/runs/${a.runId}`)}>{a.runId}</a> : '-'}</td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button onClick={() => navigate(`/alerts/${a._id}`)}>View</Button>
                        {a.status === 'open' && <Button variant="secondary" onClick={() => onResolve(a._id!)}>Resolve</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <div>Showing {data.results.length} of {data.total}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={() => setPage(Math.max(1, page - 1))}>Prev</Button>
                <Button onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </MainLayout>
  );
}
