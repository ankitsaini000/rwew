import React from "react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AuthButton = ({ children, ...props }: AuthButtonProps) => (
  <button
    style={{
      background: '#2563eb',
      color: '#fff',
      padding: 12,
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 16,
      border: 'none',
      cursor: 'pointer',
      marginTop: 8,
      width: '100%'
    }}
    {...props}
  >
    {children}
  </button>
);

export default AuthButton; 