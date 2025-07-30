"use client"; 
import DashboardLayout from "../../components/DashboardLayout";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardCard from "../../components/DashboardCard";
import DashboardGrid from "../../components/DashboardGrid";
import { FaUsers, FaQuestionCircle, FaClock } from "react-icons/fa";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AudienceGrowthSection from "../components/AudienceGrowthSection";

const CARD_HEIGHT = 100;
const CARD_PADDING = 20;

const audienceGrowthData = [
  { month: 'Jan', value: 2000 },
  { month: 'Feb', value: 12000 },
  { month: 'Mar', value: 42400 },
  { month: 'Apr', value: 35000 },
  { month: 'May', value: 41000 },
  { month: 'Jun', value: 37000 },
  { month: 'Jul', value: 52000 },
  { month: 'Aug', value: 80000 },
];

export default function DashboardPage() {
  const [creatorCount, setCreatorCount] = useState<number | null>(null);
  const [brandsCount, setBrandsCount] = useState<number | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5001/api/creators")
      .then(res => res.json())
      .then(data => {
        if (typeof data === 'object' && data !== null && typeof data.count === 'number') {
          setCreatorCount(data.count);
        } else {
          setCreatorCount(null);
        }
      })
      .catch(() => setCreatorCount(null));

    // Fetch brands count
    fetch("http://localhost:5001/api/brand-profiles/all")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBrandsCount(data.length);
        } else if (Array.isArray(data.data)) {
          setBrandsCount(data.data.length);
        } else if (typeof data.count === 'number') {
          setBrandsCount(data.count);
        } else {
          setBrandsCount(null);
        }
      })
      .catch(() => setBrandsCount(null));

    // Fetch active users count
    fetch("http://localhost:5001/api/users/active/count", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') setActiveUsersCount(data.count);
        else setActiveUsersCount(null);
      })
      .catch(() => setActiveUsersCount(null));
  }, []);

  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardGrid columns={4} style={{ marginBottom: 24, gap: 18 }}>
        <DashboardCard style={{ minHeight: CARD_HEIGHT, padding: CARD_PADDING, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ background: 'linear-gradient(135deg, #2563eb 60%, #60a5fa 100%)', borderRadius: 10, padding: 6, color: '#fff', fontSize: 18, boxShadow: '0 2px 8px #2563eb22' }}><FaUsers /></span>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Active Users</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: -1, textShadow: '0 2px 8px #2563eb11' }}>
            {activeUsersCount !== null ? activeUsersCount : '...'}
          </div>
        </DashboardCard>
        <DashboardCard style={{ minHeight: CARD_HEIGHT, padding: CARD_PADDING, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ background: 'linear-gradient(135deg, #10b981 60%, #6ee7b7 100%)', borderRadius: 10, padding: 6, color: '#fff', fontSize: 18, boxShadow: '0 2px 8px #10b98122' }}><FaQuestionCircle /></span>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Creators Count</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: -1, textShadow: '0 2px 8px #10b98111' }}>{creatorCount !== null ? `${creatorCount} Creators` : '...'}</div>
        </DashboardCard>
        <DashboardCard style={{ minHeight: CARD_HEIGHT, padding: CARD_PADDING, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ background: 'linear-gradient(135deg, #eab308 60%, #fde68a 100%)', borderRadius: 10, padding: 6, color: '#fff', fontSize: 18, boxShadow: '0 2px 8px #eab30822' }}><FaClock /></span>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Brands Count</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: -1, textShadow: '0 2px 8px #eab30811' }}>{brandsCount !== null ? `${brandsCount} Brands` : '...'}</div>
        </DashboardCard>
      </DashboardGrid>
      <AudienceGrowthSection />
    </DashboardLayout>
  );
} 