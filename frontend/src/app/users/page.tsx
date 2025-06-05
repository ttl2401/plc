"use client";

import React, { useEffect, useState } from 'react';
import { Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@/contexts/AuthContext'; // Assuming AuthContext provides the user and potentially token
import { fetchUsers } from '@/services/userService'; // Import the fetchUsers service function

const { Title } = Typography;

interface UserDataType {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string; // Assuming date strings
  updatedAt: string;
}

interface Pagination {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number | undefined; // Allow undefined to match service type
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null; // Make optional to match service type
  nextPage?: number | null; // Make optional to match service type
}

const UsersPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth(); // Get auth state
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    totalDocs: 0,
    limit: 10,
    totalPages: 0,
    page: 1, // Initial state is a number
    pagingCounter: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });

  useEffect(() => {
    const loadUsers = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        // Use the imported fetchUsers service function
        const data = await fetchUsers(pagination.page, pagination.limit);

        if (data.success) {
          setUsers(data.data);
          setPagination(data.pagination);
        } else {
          message.error(data.message || 'Failed to fetch users');
          setUsers([]);
          setPagination(prev => ({
            ...prev,
            totalDocs: 0,
            totalPages: 0,
            pagingCounter: 0,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
          }));
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        message.error('Failed to load users.');
        setUsers([]);
        setPagination(prev => ({
          ...prev,
          totalDocs: 0,
          totalPages: 0,
          pagingCounter: 0,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        }));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [pagination.page, pagination.limit, isAuthenticated]); // Refetch when page, limit or auth state changes

  const columns: ColumnsType<UserDataType> = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
  ];

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  return (
    <div>
      <Title level={2}>Users</Title>
      <Table
        columns={columns}
        dataSource={users.map(user => ({ ...user, key: user._id }))}
        loading={loading}
        pagination={{
          current: pagination.page || 1, // Provide a default value if undefined
          pageSize: pagination.limit,
          total: pagination.totalDocs,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50', '100'],
        }}
        onChange={handleTableChange}
        rowKey="_id"
      />
    </div>
  );
};

export default UsersPage; 