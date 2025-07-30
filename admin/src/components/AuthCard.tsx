import React from "react";

const AuthCard = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: 360, maxWidth: '90vw' }}>
    {children}
  </div>
);

export default AuthCard; 