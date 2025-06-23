"use client";

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

const LoginPage = () => {
  const { login, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      message.success('Login successful!');
      // Use replace to prevent going back to login page
      router.replace('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title level={3}>PLC Demo</Title>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full"
              loading={loading}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage; 