'use client';

import React from 'react';
import { Card, Row, Col } from 'antd';
import { Line, Column, Pie } from '@ant-design/plots';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ChartsPage = () => {
  // Sample data for line chart
  const lineData = [
    { year: '2019', value: 3 },
    { year: '2020', value: 4 },
    { year: '2021', value: 3.5 },
    { year: '2022', value: 5 },
    { year: '2023', value: 4.9 },
    { year: '2024', value: 6 },
  ];

  // Sample data for column chart
  const columnData = [
    { type: 'Jan', value: 38 },
    { type: 'Feb', value: 52 },
    { type: 'Mar', value: 61 },
    { type: 'Apr', value: 45 },
    { type: 'May', value: 48 },
    { type: 'Jun', value: 38 },
  ];

  // Sample data for pie chart
  const pieData = [
    { type: 'Category 1', value: 27 },
    { type: 'Category 2', value: 25 },
    { type: 'Category 3', value: 18 },
    { type: 'Category 4', value: 15 },
    { type: 'Category 5', value: 10 },
  ];

  const lineConfig = {
    data: lineData,
    xField: 'year',
    yField: 'value',
    smooth: true,
    point: {
      size: 5,
    },
  };

  const columnConfig = {
    data: columnData,
    xField: 'type',
    yField: 'value',
    label: {
      position: 'top',
    },
  };

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Performance Trend">
              <Line {...lineConfig} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="Monthly Statistics">
              <Column {...columnConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Category Distribution">
              <Pie {...pieConfig} />
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};

export default ChartsPage; 