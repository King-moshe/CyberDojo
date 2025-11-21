import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

type Props = { children: React.ReactNode };

export default function MainLayout({ children }: Props) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <div className="content">
        <div className="topbar">
          <Topbar />
        </div>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
