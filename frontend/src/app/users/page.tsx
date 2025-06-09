"use client";

import React, { useEffect, useState } from 'react';
import { Table, Typography, message, Input, Button, Space, Flex, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@/contexts/AuthContext'; // Assuming AuthContext provides the user and potentially token
import { fetchUsers, deleteUser } from '@/services/userService'; // Import fetchUsers and deleteUser service functions
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import UserDetailForm from './detail'; // Import the UserDetailForm component

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal; // Destructure confirm from Modal

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

  // State for search input
  const [searchText, setSearchText] = useState('');

  // State for modal visibility and editing user ID
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined);

  // Function to load users from the API
  const loadUsers = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      // Use the imported fetchUsers service function, passing pagination and search
      const data = await fetchUsers(pagination.page, pagination.limit, searchText);

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

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit, isAuthenticated, searchText]); // Refetch when page, limit, auth state, or search text changes

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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => {
            // TODO: Implement edit action
            console.log('Edit user:', record._id);
            message.info(`Edit user with ID: ${record._id}`);
            showModal(record._id); // Open modal for editing
          }} style={{ cursor: 'pointer', color: '#1677ff' }}>Edit</a>
          <a onClick={() => {
            // TODO: Implement delete action
            console.log('Delete user:', record._id);
            showDeleteConfirm(record._id, record.name); // Show delete confirmation
          }} style={{ cursor: 'pointer', color: '#ff4d4f' }}>Delete</a>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  // Handle search input change
  const handleSearch = (value: string) => {
    // No need to manually trigger fetch here, useEffect will handle it when searchText changes
    setSearchText(value);
    console.log('Searching for:', value);
  };

  // Handle modal open
  const showModal = (userId?: string) => {
    setEditingUserId(userId);
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUserId(undefined); // Clear editing user ID
  };

  // Handle successful form submission (close modal and refresh table)
  const handleSuccess = () => {
    setIsModalVisible(false);
    setEditingUserId(undefined); // Clear editing user ID
    // Trigger a data refetch after successful creation/update
    loadUsers();
  };

  // Handle delete action with confirmation
  const showDeleteConfirm = (userId: string, userName: string) => {
    confirm({
      title: `Are you sure delete user ${userName}?`,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          const result = await deleteUser(userId);
          if (result.success) {
            message.success(result.message || 'User deleted successfully');
            loadUsers(); // Refresh user list after deletion
          } else {
            message.error(result.message || 'Failed to delete user');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          message.error('An error occurred while deleting the user.');
        }
      },
      onCancel() {
        console.log('Delete cancelled');
      },
    });
  };

  // Handle create new button click
  const handleCreateNew = () => {
    showModal(undefined); // Open modal for new user
  };

  return (
    <div>
      <Title level={2}>Users</Title>

      <Flex justify="space-between" style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search user name or email"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
          Create New
        </Button>
      </Flex>

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

      <UserDetailForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
        userId={editingUserId}
      />
    </div>
  );
};

export default UsersPage; 