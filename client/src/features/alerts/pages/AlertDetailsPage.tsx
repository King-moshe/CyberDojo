import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { getAlertById, resolveAlert as apiResolve } from '../../../api/alertsApi';
import type { Alert } from '../../../types/api';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useToast } from '../../../components/common/ToastProvider';
import formatDate from '../../../utils/formatDate';
import { mapSeverityToColor } from '../../../utils/mapSeverityToColor';

export default function AlertDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAlertById(id)
      .then((a) => setAlert(a))
      .catch((e) => { console.error(e); toast.show('Failed to load alert', 'error'); })
      .finally(() => setLoading(false));
  }, [id]);

  const onResolve = async () => {
    if (!id) return;
    try {
      const updated = await apiResolve(id);
      setAlert(updated);
      toast.show('Alert resolved', 'success');
    } catch (e) {
      console.error(e);
      toast.show('Failed to resolve alert', 'error');
    }
  };

  if (loading) return (
    <MainLayout>
      <Card>Loading...</Card>
    </MainLayout>
  );

  if (!alert) return (
    <MainLayout>
      <Card>Alert not found.</Card>
    </MainLayout>
  );

  return (
    <MainLayout>
      <h2>Alert Details</h2>
      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ padding: '8px 12px', borderRadius: 6, background: mapSeverityToColor(alert.severity), color: '#fff' }}>{alert.severity}</div>
          <div style={{ fontWeight: 700 }}>{alert.type}</div>
          <div style={{ marginLeft: 'auto' }}>{alert.status}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Message</div>
          <div>{alert.message}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Context</div>
          <div>Scenario: {alert.scenarioId ? <a onClick={() => navigate(`/scenarios/${alert.scenarioId}`)}>{alert.scenarioId}</a> : '-'}</div>
          <div>Run: {alert.runId ? <a onClick={() => navigate(`/runs/${alert.runId}`)}>{alert.runId}</a> : '-'}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div>Created: {formatDate(alert.createdAt)}</div>
          <div>Updated: {formatDate(alert.updatedAt)}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          {alert.details && (
            <div>
              <div style={{ fontWeight: 600 }}>Details</div>
              <pre style={{ background: '#f6f6f6', padding: 8 }}>{typeof alert.details === 'string' ? alert.details : JSON.stringify(alert.details, null, 2)}</pre>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {alert.status === 'open' && <Button onClick={onResolve}>Resolve</Button>}
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </Card>
    </MainLayout>
  );
}
