import React from "react";

export default function DashboardCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.85)',
      borderRadius: 20,
      boxShadow: '0 4px 24px rgba(37,99,235,0.10), 0 1.5px 6px rgba(0,0,0,0.04)',
      border: '1.5px solid rgba(37,99,235,0.08)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      padding: 32,
      transition: 'box-shadow 0.2s, transform 0.2s',
      willChange: 'transform',
      ...style
    }}>
      {children}
    </div>
  );
} 