import React, { useMemo, useState } from 'react';
import { Scenario } from '../../../types/api';
import { runScenario } from '../../../api/scenariosApi';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/common/ToastProvider';

type Props = {
  scenario: Scenario;
  onClose?: () => void;
};

function buildCurl(step: any) {
  if (!step || step.type !== 'http') return '';
  const method = (step.method || 'GET').toUpperCase();
  const url = step.url || '';
  let cmd = `curl -X ${method} '${url}'`;
  if (step.body) {
    const body = typeof step.body === 'string' ? step.body : JSON.stringify(step.body);
    // escape single quotes in body
    const safe = body.replace(/'/g, "'\\''");
    cmd += ` -H 'Content-Type: application/json' -d '${safe}'`;
  }
  return cmd;
}

function copyToClipboard(text: string) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (_) {}
  ta.remove();
  return Promise.resolve();
}

export default function ScenarioPreview({ scenario, onClose }: Props) {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const toast = useToast();
  const steps = (scenario.steps || []) as any[];

  const validation = useMemo(() => {
    const issues: string[] = [];
    if (!scenario.name || scenario.name.trim().length === 0) issues.push('Missing scenario name');
    if (!Array.isArray(steps)) issues.push('Steps should be an array');
    else {
      steps.forEach((s, i) => {
        if (!s || !s.type) issues.push(`Step ${i + 1}: missing type`);
        if (s.type === 'http') {
          if (!s.url) issues.push(`Step ${i + 1}: missing URL`);
          const method = (s.method || 'GET').toUpperCase();
          const allowed = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
          if (!allowed.includes(method)) issues.push(`Step ${i + 1}: unsupported method ${method}`);
        }
      });
    }
    return issues;
  }, [scenario, steps]);

  const onCopyAll = async () => {
    const all = steps.map((s, i) => `# Step ${i + 1}\n${buildCurl(s)}`).join('\n\n');
    await copyToClipboard(all);
    try { toast.show('Copied cURL for all steps', 'success'); } catch (_) {}
  };

  const onCopyStep = async (s: any) => {
    const cmd = buildCurl(s);
    if (!cmd) return;
    await copyToClipboard(cmd);
    try { toast.show('Copied cURL', 'success'); } catch (_) {}
  };

  const onRun = async () => {
    if (!scenario._id && !scenario.id) return;
    if (!window.confirm('Run this scenario now? This will execute configured steps.')) return;
    try {
      setRunning(true);
      const res = await runScenario(scenario._id || scenario.id || '');
      const runId = res?.data?._id || res?._id || res?.data?.id || res?.id || res?.runId;
      if (runId) navigate(`/runs/${runId}`);
    } catch (err) {
      console.error('Failed to run scenario', err);
      try { toast.show('Failed to start run', 'error'); } catch (_) {}
    } finally {
      setRunning(false);
      onClose && onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, background: 'var(--card)', boxShadow: ' -8px 0 24px rgba(2,6,23,0.12)', zIndex: 60, padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>{scenario.name}</h3>
          <div className="muted">Preview</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onCopyAll}>Copy cURL</button>
          <button className="btn btn-primary" onClick={onRun} disabled={running}>{running ? 'Running…' : 'Run'}</button>
          <button className="btn" onClick={() => onClose && onClose()}>Close</button>
        </div>
      </div>

      <div style={{ marginTop: 12, overflow: 'auto', flex: 1 }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <strong>Description</strong>
          <p className="muted" style={{ marginTop: 8 }}>{scenario.description || <em>No description</em>}</p>
        </div>

        <div className="card">
          <strong>Steps</strong>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.length === 0 && <div className="muted">No steps defined.</div>}
            {steps.map((s, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>Step {i + 1} <span style={{ fontWeight: 500, marginLeft: 8, color: 'var(--muted)', fontSize: 12 }}>{s.type}</span></div>
                  <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 13 }}>{s.type === 'http' ? `${(s.method || 'GET').toUpperCase()} ${s.url || ''}` : JSON.stringify(s)}</div>
                </div>
                <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.type === 'http' && <button className="btn btn-ghost" onClick={() => onCopyStep(s)}>Copy cURL</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {validation.length > 0 && (
          <div className="card" style={{ marginTop: 12, borderLeft: '3px solid #f59e0b' }}>
            <strong>Validation Warnings</strong>
            <ul style={{ marginTop: 8 }}>
              {validation.map((v, i) => <li key={i} className="muted">{v}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
