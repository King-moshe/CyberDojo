import React, { useEffect, useState } from 'react';
import AppRoutes from './routes';
import { ToastProvider } from './components/common/ToastProvider';

const THEME_KEY = 'theme';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      /* ignore */
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'background 200ms linear, color 200ms linear' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'var(--card)' }}>
        <div style={{ fontWeight: 600 }}>CyberDojo</div>
        <div>
          <button onClick={toggle} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--muted)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
            {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </button>
        </div>
      </header>

      <main style={{ padding: 16 }}>
        <AppRoutes />
        </main>
      </div>
    </ToastProvider>
  );
}
