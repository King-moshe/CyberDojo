import React from 'react';

export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ padding: '4px 8px', background: '#eef2ff', borderRadius: 4, fontSize: 12 }}>
      {children}
    </span>
  );
}
