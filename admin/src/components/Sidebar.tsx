"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const sidebarLinks = [
  { label: "Reports", icon: "📊", route: "/dashboard", active:true },
  { label: "Creator", icon: "🧑‍🎤", route: "/creator" },
  { label: "Brand", icon: "🏢", route: "/brand" },
  { label: "Orders", icon: "🛒", route: "/orders" }, // Added Orders link
  { label: "Invoices", icon: "🧾", route: "/invoices" }, // Added Invoices link
  { label: "Messages", icon: "💬", route: "/messages" },
  { label: "Documents / verifaiction", icon: "📄", route: "/documents-verification" }, // Added Documents link
  { label: "All Promotions", icon: "🎁", route: "/all-promotions" }, // Added All Promotions link
  { label: "Quote Requests", icon: "📝", route: "/quote-requests" }, // Added Quote Requests link
  { label: "Work Submissions", icon: "📦", route: "/work-submissions" }, // Added Work Submissions link
  { label: "Suspend/Deactivate Account", icon: "⛔", route: "/suspend-account" }, // Added link
  { label: "People", icon: "👥" },
  { label: "Activities", icon: "📝" },
  { label: "Get Started", icon: "❓", support: true },
  { label: "Settings", icon: "⚙️", support: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside style={{
      width: 260,
      background: 'linear-gradient(135deg, #f0f4ff 60%, #e0e7ef 100%)',
      borderRight: '1.5px solid #e0e7ef',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 28,
      boxShadow: '4px 0 24px rgba(37,99,235,0.06)',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div>
        {/* Logo */}
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 2, color: '#2563eb', marginBottom: 38, textShadow: '0 2px 8px #2563eb22', textAlign: 'center' }}>Influencer</div>
        {/* Nav */}
        <nav>
          {sidebarLinks.filter(l => !l.support).map(link => {
            const isActive = link.route && pathname.startsWith(link.route);
            return link.route ? (
              <Link href={link.route} key={link.label} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '13px 0 13px 18px',
                    fontWeight: 600,
                    fontSize: 18,
                    color: isActive ? '#fff' : '#222',
                    background: isActive ? 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)' : 'transparent',
                    borderRadius: 12,
                    marginBottom: 6,
                    boxShadow: isActive ? '0 2px 12px #2563eb22' : undefined,
                    cursor: 'pointer',
                    transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                    borderLeft: isActive ? '4px solid #2563eb' : '4px solid transparent',
                    position: 'relative',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLDivElement).style.background = isActive ? 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)' : '#f1f5f9';
                    (e.currentTarget as HTMLDivElement).style.color = isActive ? '#fff' : '#2563eb';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLDivElement).style.background = isActive ? 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)' : 'transparent';
                    (e.currentTarget as HTMLDivElement).style.color = isActive ? '#fff' : '#222';
                  }}
                >
                  <span style={{ fontSize: 22 }}>{link.icon}</span> {link.label}
                </div>
              </Link>
            ) : (
              <div
                key={link.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '13px 0 13px 18px',
                  fontWeight: 600,
                  fontSize: 18,
                  color: '#222',
                  background: 'transparent',
                  borderRadius: 12,
                  marginBottom: 6,
                  cursor: 'pointer',
                  transition: 'background 0.18s, color 0.18s',
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '#f1f5f9';
                  (e.currentTarget as HTMLDivElement).style.color = '#2563eb';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.color = '#222';
                }}
              >
                <span style={{ fontSize: 22 }}>{link.icon}</span> {link.label}
              </div>
            );
          })}
        </nav>
        <div style={{ margin: '38px 0 0 0', borderTop: '1.5px solid #e0e7ef', paddingTop: 18 }}>
          <div style={{ fontSize: 14, color: '#8b98a9', marginBottom: 10, fontWeight: 600 }}>Support</div>
          {sidebarLinks.filter(l => l.support).map(link => (
            <div
              key={link.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '11px 0 11px 18px',
                fontWeight: 600,
                fontSize: 17,
                color: '#444',
                borderRadius: 9,
                marginBottom: 2,
                cursor: 'pointer',
                transition: 'background 0.18s, color 0.18s',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#f1f5f9';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 19 }}>{link.icon}</span> {link.label}
            </div>
          ))}
        </div>
      </div>
      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 38, background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10, boxShadow: '0 2px 12px #2563eb11', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #dbeafe 60%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#2563eb', boxShadow: '0 2px 8px #2563eb11' }}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#18181b' }}>Sam Wheeler</div>
            <div style={{ fontSize: 13, color: '#8b98a9', fontWeight: 500 }}>samwheeler@example.com</div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          style={{ marginTop: 18, background: '#e00', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e00a' }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
} 