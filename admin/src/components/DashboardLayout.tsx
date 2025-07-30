"use client";

import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ flex: 1, padding: 40, minWidth: 0 }}>{children}</main>
  );
} 