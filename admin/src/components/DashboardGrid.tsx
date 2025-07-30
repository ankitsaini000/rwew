import React from "react";

export default function DashboardGrid({ children, columns = 4, style }: { children: React.ReactNode; columns?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 28,
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
} 