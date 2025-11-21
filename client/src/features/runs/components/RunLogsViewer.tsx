import React, { useEffect, useRef } from 'react';

export default function RunLogsViewer({ logs, autoScroll = false }: { logs?: string[]; autoScroll?: boolean }) {
  const preRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const el = preRef.current;
    if (el) {
      // scroll to bottom
      el.scrollTop = el.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <pre ref={preRef} style={{ background: '#111', color: '#fff', padding: 12, borderRadius: 6, overflow: 'auto', maxHeight: '60vh' }}>
      {logs?.join('\n') || ''}
    </pre>
  );
}
