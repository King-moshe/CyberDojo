import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast, { ToastMessage } from './Toast';

type ToastContextValue = {
  show: (text: string, type?: ToastMessage['type']) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: string) => setMessages((m) => m.filter((x) => x.id !== id)), []);

  const show = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const msg: ToastMessage = { id, text, type };
    setMessages((m) => [msg, ...m]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m) => (
          <div key={m.id}><Toast msg={m} onClose={() => remove(m.id)} /></div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
