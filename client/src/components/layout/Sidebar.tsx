import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>CyberDojo</h2>
        <div className="muted">Security training</div>
      </div>

      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>
            <NavLink to="/" style={({ isActive }) => ({ padding: '8px 10px', display: 'block', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent' })}>
              Dashborard
            </NavLink>
          </li>
          <li>
            <NavLink to="/scenarios" style={({ isActive }) => ({ padding: '8px 10px', display: 'block', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent' })}>
              Scenarios
            </NavLink>
          </li>
          <li>
            <NavLink to="/runs" style={({ isActive }) => ({ padding: '8px 10px', display: 'block', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent' })}>
              Runs
            </NavLink>
          </li>
          <li>
            <NavLink to="/alerts" style={({ isActive }) => ({ padding: '8px 10px', display: 'block', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent' })}>
              Alerts
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
