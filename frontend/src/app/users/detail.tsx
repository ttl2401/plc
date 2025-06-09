"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Modal, Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserById, createUser, updateUser } from '@/services/userService';

const { Option } = Select;

interface UserDetailFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  userId?: string; // Optional user ID for editing
}

const UserDetailForm: React.FC<UserDetailFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  userId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user: currentUser } = useAuth(); // Get current logged-in user for role check

  // Fetch user data if userId is provided (editing mode)
  useEffect(() => {
    if (visible && userId) {
      setLoading(true);
      const fetchUserData = async () => {
        try {
          const data = await fetchUserById(userId);
          if (data.success) {
            form.setFieldsValue(data.data);
          } else {
            message.error(data.message || 'Failed to fetch user data');
            onCancel(); // Close modal on error
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          message.error('Failed to fetch user data.');
          onCancel(); // Close modal on error
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else if (visible && !userId) {
      // Reset form for creating a new user
      form.resetFields();
    }
  }, [visible, userId, form, onCancel]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      if (userId) {
        const data = await updateUser(userId, values);
        if (data.success) {
          message.success('User updated successfully');
          onSuccess();
        } else {
          message.error(data.message || 'Failed to update user');
        }
      } else {
        const data = await createUser(values);
        if (data.success) {
          message.success('User created successfully');
          onSuccess();
        } else {
          message.error(data.message || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      message.error(`Failed to ${userId ? 'update' : 'create'} user.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={userId ? 'Edit User' : 'Create User'}
      okText={userId ? 'Update' : 'Create'}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={"50%"}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          name="user_detail_form"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter user email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            {userId ? <Input disabled /> : <Input />}{/* Disable email edit for existing users */}
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select user role!' }]}>
             <Select placeholder="Select a role">
               {currentUser?.role === 'admin' && <Option value="admin">Admin</Option>}
               {currentUser?.role === 'admin' && <Option value="manager">Manager</Option>}
               <Option value="user">User</Option>
             </Select>
          </Form.Item>
          {!userId && ( // Password field only for creating new users
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password!' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default UserDetailForm;
