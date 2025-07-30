import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
        {label}
      </label>
      <input
        ref={ref}
        style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
        {...props}
      />
    </div>
  )
);
AuthInput.displayName = "AuthInput";

export default AuthInput; 