import React from 'react';
import { AttackStep, HttpStep, PauseStep, AssertStatusStep, AssertBodyContainsStep } from '../../../types/api';

type Props = {
  step: AttackStep;
  index: number;
  onChange: (idx: number, step: AttackStep) => void;
  onDelete: (idx: number) => void;
  onDuplicate: (idx: number) => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
};

export default function AttackStepEditor({ step, index, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown }: Props) {
  const commonLabel = (label: string) => (<div style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>{label}</div>);

  const update = (patch: Partial<AttackStep>) => {
    onChange(index, { ...(step as any), ...patch } as AttackStep);
  };

  return (
    <div style={{ border: '1px solid #e6e6e6', padding: 10, borderRadius: 6, marginBottom: 8, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600 }}>Step {index + 1} — {step.type}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onMoveUp(index)} title="Move up">↑</button>
          <button onClick={() => onMoveDown(index)} title="Move down">↓</button>
          <button onClick={() => onDuplicate(index)} title="Duplicate">⎘</button>
          <button onClick={() => onDelete(index)} title="Delete">✕</button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        {commonLabel('Type')}
        <select value={step.type} onChange={(e) => update({ type: e.target.value } as any)}>
          <option value="http">http</option>
          <option value="pause">pause</option>
          <option value="assertStatus">assertStatus</option>
          <option value="assertBodyContains">assertBodyContains</option>
        </select>
      </div>

      {step.type === 'http' && (
        <div style={{ marginTop: 8 }}>
          {commonLabel('Method')}
          <select value={(step as HttpStep).method || 'GET'} onChange={(e) => update({ method: e.target.value } as any)}>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>

          {commonLabel('URL')}
          <input style={{ width: '100%' }} value={(step as HttpStep).url || ''} onChange={(e) => update({ url: e.target.value } as any)} />

          {commonLabel('Body (optional)')}
          <textarea style={{ width: '100%' }} value={(step as HttpStep).body ? String((step as HttpStep).body) : ''} onChange={(e) => update({ body: e.target.value } as any)} />
        </div>
      )}

      {step.type === 'pause' && (
        <div style={{ marginTop: 8 }}>
          {commonLabel('Duration (ms)')}
          <input type="number" value={(step as PauseStep).durationMs || 1000} onChange={(e) => update({ durationMs: Number(e.target.value) } as any)} />
        </div>
      )}

      {step.type === 'assertStatus' && (
        <div style={{ marginTop: 8 }}>
          {commonLabel('Expected Status')}
          <input type="number" value={(step as AssertStatusStep).expected || (step as any).expectedStatus || 200} onChange={(e) => update({ expected: Number(e.target.value) } as any)} />
        </div>
      )}

      {step.type === 'assertBodyContains' && (
        <div style={{ marginTop: 8 }}>
          {commonLabel('Expected Substring')}
          <input value={(step as AssertBodyContainsStep).contains || ''} onChange={(e) => update({ contains: e.target.value } as any)} />
        </div>
      )}
    </div>
  );
}
