import React, { useState } from 'react';
import { Scenario } from '../../../types/api';
import Button from '../../../components/common/Button';

type Props = {
  initial?: Partial<Scenario>;
  onCancel?: () => void;
  onSubmit: (payload: Partial<Scenario>) => Promise<void> | void;
  submitLabel?: string;
};

export default function ScenarioForm({ initial = {}, onCancel, onSubmit, submitLabel = 'Save' }: Props) {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [stepsText, setStepsText] = useState(JSON.stringify(initial.steps || [], null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedStepsCount, setParsedStepsCount] = useState<number>((initial.steps || []).length || 0);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    let steps: any[] = [];
    try {
      steps = JSON.parse(stepsText || '[]');
    } catch (err) {
      setParseError('Invalid JSON for steps — please fix before submitting.');
      return;
    }

    if (!name.trim()) {
      setParseError(null);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ name, description, steps });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} aria-labelledby="scenario-form-title">
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="scenario-name" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Name</label>
        <input id="scenario-name" className="search" value={name} onChange={(e) => setName(e.target.value)} placeholder="Scenario name" aria-required />
        {!name.trim() && <div role="alert" style={{ color: '#b00020', fontSize: 12, marginTop: 6 }}>Name is required.</div>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="scenario-desc" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Description</label>
        <textarea id="scenario-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="scenario-steps" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Steps (JSON)</label>
        <textarea
          id="scenario-steps"
          value={stepsText}
          onChange={(e) => {
            const v = e.target.value;
            setStepsText(v);
            try {
              const parsed = JSON.parse(v || '[]');
              setParseError(null);
              setParsedStepsCount(Array.isArray(parsed) ? parsed.length : 1);
            } catch (err) {
              setParseError('Invalid JSON');
              setParsedStepsCount(0);
            }
          }}
          rows={8}
          style={{ fontFamily: 'monospace', fontSize: 12, padding: 8, borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }}
          placeholder={`Example:\n[\n  { "type": "http", "method": "GET", "url": "https://example.com" }\n]`} 
          aria-invalid={!!parseError}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
          <div className="small-muted">Parsed steps: {parsedStepsCount}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {parseError && <div role="alert" style={{ color: '#b00020', fontSize: 12 }}>{parseError}</div>}
            <Button type="button" variant="secondary" onClick={() => setShowPreview((s) => !s)}>{showPreview ? 'Hide Preview' : 'Preview Steps'}</Button>
          </div>
        </div>

        {showPreview && !parseError && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Steps Preview</div>
            <pre className="card" style={{ padding: 12, whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto' }}>{(() => {
              try { return JSON.stringify(JSON.parse(stepsText || '[]'), null, 2); } catch (e) { return 'Invalid JSON'; }
            })()}</pre>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" disabled={saving || !!parseError || !name.trim()}>{saving ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  );
}
