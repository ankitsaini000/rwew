'use client';

import React from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </NotificationProvider>
    </AuthProvider>
  );
} 