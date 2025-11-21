import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import AttackStepEditor from '../components/AttackStepEditor';
import { Scenario, ScenarioInput, AttackStep } from '../../../types/api';
import * as scenariosApi from '../../../api/scenariosApi';
import { useToast } from '../../../components/common/ToastProvider';

export default function ScenarioBuilderPage() {
  const { id } = useParams<{ id?: string }>();
  const editMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<AttackStep[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editMode && id) {
      scenariosApi.getScenarioById(id).then((s) => {
        if (s) {
          setName(s.name || '');
          setDescription(s.description || '');
          setSteps(s.steps || []);
        }
      }).catch(() => {
        toast.show('Failed to load scenario', 'error');
      });
    } else {
      // default with one http step
      setSteps([{ type: 'http', method: 'GET', url: 'http://localhost/' } as any]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, id]);

  const setStep = (idx: number, step: AttackStep) => {
    setSteps((s) => s.map((it, i) => (i === idx ? step : it)));
  };

  const addStep = (afterIndex?: number) => {
    const newStep: AttackStep = { type: 'http', method: 'GET', url: 'http://localhost/' } as any;
    setSteps((s) => {
      const copy = s.slice();
      if (typeof afterIndex === 'number') copy.splice(afterIndex + 1, 0, newStep);
      else copy.push(newStep);
      return copy;
    });
  };

  const deleteStep = (idx: number) => setSteps((s) => s.filter((_, i) => i !== idx));
  const duplicateStep = (idx: number) => setSteps((s) => { const copy = s.slice(); copy.splice(idx + 1, 0, JSON.parse(JSON.stringify(s[idx]))); return copy; });
  const moveUp = (idx: number) => setSteps((s) => { if (idx <= 0) return s; const copy = s.slice(); const [it] = copy.splice(idx, 1); copy.splice(idx - 1, 0, it); return copy; });
  const moveDown = (idx: number) => setSteps((s) => { if (idx >= s.length - 1) return s; const copy = s.slice(); const [it] = copy.splice(idx, 1); copy.splice(idx + 1, 0, it); return copy; });

  const validate = (): string | null => {
    if (!name || !name.trim()) return 'Name is required';
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i] as any;
      if (st.type === 'http') {
        if (!st.url || !st.url.trim()) return `Step ${i + 1}: URL is required`;
        if (!st.method) return `Step ${i + 1}: Method is required`;
      }
      if (st.type === 'assertStatus') {
        if (typeof st.expected !== 'number') return `Step ${i + 1}: expected status is required`;
      }
      if (st.type === 'assertBodyContains') {
        if (!st.contains || !st.contains.trim()) return `Step ${i + 1}: expected substring is required`;
      }
    }
    return null;
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validate();
    if (err) { toast.show(err, 'error'); return; }
    setSaving(true);
    const payload: ScenarioInput = { name: name.trim(), description: description.trim(), steps };
    try {
      if (editMode && id) {
        const updated = await scenariosApi.updateScenario(id, payload);
        toast.show('Scenario updated', 'success');
        navigate(`/scenarios/${updated?._id || id}`);
      } else {
        const created = await scenariosApi.createScenario(payload);
        toast.show('Scenario created', 'success');
        navigate(`/scenarios/${created._id}`);
      }
    } catch (err) {
      console.error('Save failed', err);
      toast.show('Failed to save scenario', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <h2>{editMode ? 'Edit Scenario' : 'New Scenario'}</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontWeight: 600 }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontWeight: 600 }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>Steps ({steps.length})</div>
            <div>
              <button type="button" onClick={() => addStep()} style={{ marginRight: 8 }}>Add Step</button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            {steps.map((s, idx) => (
              <AttackStepEditor
                key={idx}
                step={s}
                index={idx}
                onChange={setStep}
                onDelete={deleteStep}
                onDuplicate={duplicateStep}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : editMode ? 'Update Scenario' : 'Create Scenario'}</button>
          <button type="button" onClick={() => navigate(editMode ? `/scenarios/${id}` : '/scenarios')}>Cancel</button>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#666' }}>
            <strong>JSON Preview</strong>
          </div>
        </div>

        <pre style={{ marginTop: 12, background: '#f6f6f6', padding: 12, borderRadius: 6 }}>{JSON.stringify({ name, description, steps }, null, 2)}</pre>
      </form>
    </MainLayout>
  );
}
