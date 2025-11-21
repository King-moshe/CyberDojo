import React from 'react';

export type ToastMessage = { id: string; type?: 'success' | 'error' | 'info'; text: string };

export default function Toast({ msg, onClose }: { msg: ToastMessage; onClose: () => void }) {
  const bg = msg.type === 'error' ? '#fee2e2' : msg.type === 'success' ? '#ecfdf5' : '#eef2ff';
  const border = msg.type === 'error' ? '#fca5a5' : msg.type === 'success' ? '#34d399' : '#93c5fd';
  return (
    <div style={{ background: bg, borderLeft: `4px solid ${border}`, padding: '10px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.08)', minWidth: 220 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13 }}>{msg.text}</div>
        <button onClick={onClose} style={{ marginLeft: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
}
