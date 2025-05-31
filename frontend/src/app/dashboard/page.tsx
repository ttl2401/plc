'use client';

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import DashboardLayout from '@/components/layout/DashboardLayout';

const DashboardPage = () => {
  // Sample data for the line chart
  const data = [
    { year: '2019', value: 3 },
    { year: '2020', value: 4 },
    { year: '2021', value: 3.5 },
    { year: '2022', value: 5 },
    { year: '2023', value: 4.9 },
    { year: '2024', value: 6 },
  ];

  const config = {
    data,
    xField: 'year',
    yField: 'value',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Users"
                value={1128}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="System Load"
                value={93}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowDownOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Response Time"
                value={2.5}
                precision={1}
                valueStyle={{ color: '#3f8600' }}
                suffix="ms"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Error Rate"
                value={0.5}
                precision={1}
                valueStyle={{ color: '#3f8600' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Card title="Performance Overview">
          <Line {...config} />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 