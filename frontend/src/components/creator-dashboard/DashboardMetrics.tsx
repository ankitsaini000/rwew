"use client";

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Alert } from 'antd';
import { UserOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface Metrics {
  followers: number;
  totalEarnings: number;
  completedProjects: number;
  responseRate: number;
  tierProgress: number;
  profileViews: number;
  repeatClientRate: number;
  averageResponseTime: number;
  profileCompleteness: number;
  monthlyGrowth: {
    followers: number;
    earnings: number;
    projects: number;
  };
  influencerTier: string;
  serviceTier: string;
}

const DashboardMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5001/api/creator-dashboard/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="dashboard-metrics">
      <Row gutter={[16, 16]}>
        {/* Main Stats */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Followers"
              value={metrics.followers}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <small>Monthly Growth: {metrics.monthlyGrowth.followers.toFixed(1)}%</small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Earnings"
              value={metrics.totalEarnings}
              prefix={<DollarOutlined />}
              precision={2}
            />
            <div style={{ marginTop: 8 }}>
              <small>Monthly Growth: {metrics.monthlyGrowth.earnings.toFixed(1)}%</small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Projects"
              value={metrics.completedProjects}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <small>Monthly Growth: {metrics.monthlyGrowth.projects.toFixed(1)}%</small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Response Rate"
              value={metrics.responseRate}
              suffix="%"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        {/* Progress Metrics */}
        <Col xs={24} sm={12}>
          <Card title="Profile Completeness">
            <Progress
              percent={metrics.profileCompleteness}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Tier Progress">
            <Progress
              percent={metrics.tierProgress}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ marginTop: 8 }}>
              <small>Current Tier: {metrics.influencerTier}</small>
            </div>
          </Card>
        </Col>

        {/* Additional Stats */}
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Profile Views"
              value={metrics.profileViews}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Repeat Client Rate"
              value={metrics.repeatClientRate}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Average Response Time"
              value={metrics.averageResponseTime}
              suffix="hrs"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardMetrics;