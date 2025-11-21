import React from 'react';
import logo from '../../images/logo.png';

export default function Topbar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={logo} alt="logo" style={{ width: 36, height: 36, borderRadius: 8 }} />
        {/* <div style={{ fontWeight: 700 }}>CyberDojo</div> */}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Right side (could add user menu, notifications) */}
      </div>
    </div>
  );
}
