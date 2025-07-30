import React from "react";

export default function DashboardHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#18181b', letterSpacing: -1 }}>Reports</h1>
        <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>
          Download
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <select style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15, color: '#222', background: '#fff', fontWeight: 500 }}>
          <option>Timeframe: All-time</option>
        </select>
        <select style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15, color: '#222', background: '#fff', fontWeight: 500 }}>
          <option>People: All</option>
        </select>
        <select style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15, color: '#222', background: '#fff', fontWeight: 500 }}>
          <option>Topic: All</option>
        </select>
      </div>
    </div>
  );
} 