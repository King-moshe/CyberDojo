import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { getScenario, runScenario } from '../../../api/scenariosApi';
import { useToast } from '../../../components/common/ToastProvider';
import { Scenario } from '../../../types/api';

export default function ScenarioDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getScenario(id)
      .then((s) => setScenario(s))
      .catch(() => setScenario(null))
      .finally(() => setLoading(false));
  }, [id]);

  const onRun = async () => {
    if (!id) return;
    try {
      setRunning(true);
      const res = await runScenario(id);
      const runId = res?._id || res?.data?._id || res?.id || res?.data?.id || res?.runId;
      if (runId) navigate(`/runs/${runId}`);
    } catch (err) {
      console.error('Failed to run scenario', err);
      try { toast.show('Failed to start run', 'error'); } catch (_) {}
    } finally {
      setRunning(false);
    }
  };

  const onDryRun = async () => {
    if (!id) return;
    try {
      setRunning(true);
      const api = await import('../../../api/scenariosApi');
      const res = await api.dryRunScenario(id);
      const runId = res?._id || res?.data?._id || res?.id || res?.data?.id || res?.runId;
      if (runId) navigate(`/runs/${runId}`);
    } catch (err) {
      console.error('Dry-run failed', err);
      try { toast.show('Dry-run failed', 'error'); } catch (_) {}
    } finally {
      setRunning(false);
    }
  };

  return (
    <MainLayout>
      <h2>Scenario Details</h2>
      {loading && <div>Loading...</div>}
      {!loading && !scenario && <div>Scenario not found.</div>}
      {scenario && (
        <div>
          <h3>{scenario.name}</h3>
          <p>{scenario.description}</p>
          <div>
            <strong>Steps:</strong>
            <pre style={{ background: '#f6f6f6', padding: 8, borderRadius: 4 }}>{JSON.stringify(scenario.steps || [], null, 2)}</pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={onRun} disabled={running} style={{ marginRight: 8 }}>
              {running ? 'Running…' : 'Run Scenario'}
            </button>
            <button onClick={onDryRun} disabled={running} style={{ marginRight: 8 }}>
              {running ? 'Running…' : 'Dry Run'}
            </button>
            <button onClick={() => navigate(`/scenarios/${id}/edit`)}>
              Edit
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
