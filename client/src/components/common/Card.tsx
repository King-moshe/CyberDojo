import React from 'react';

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 6, background: '#fff' }}>
      {children}
    </div>
  );
}
