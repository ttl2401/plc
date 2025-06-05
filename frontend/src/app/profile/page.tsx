"use client";

import React from 'react';
import { Card, Form, Input, Button, Avatar, Typography, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

const ProfilePage = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    message.success('Profile updated successfully');
    console.log('Updated values:', values);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="text-center mb-8">
          <Avatar size={100} icon={<UserOutlined />} />
          <Title level={3} className="mt-4">
            {user?.name}
          </Title>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: '+1 234 567 890',
            company: 'Demo Company',
            position: 'Software Engineer',
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please input your phone number!' }]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company"
            rules={[{ required: true, message: 'Please input your company!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: 'Please input your position!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage; 