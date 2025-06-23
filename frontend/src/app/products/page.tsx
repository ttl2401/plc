"use client";

import React, { useEffect, useState } from 'react';
import { Table, Typography, message, Input, Button, Space, Flex, Modal, Image } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProducts, deleteProduct, type ProductDataType, downloadProductsExcel } from '@/services/productService';
import { SearchOutlined, PlusOutlined, ExportOutlined } from '@ant-design/icons';
import ProductDetailForm from './detail';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

interface Pagination {
  totalDocs: number;
  limit: number | undefined;
  totalPages: number;
  page: number | undefined;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

const ProductsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<ProductDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    totalDocs: 0,
    limit: 10,
    totalPages: 0,
    page: 1,
    pagingCounter: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });

  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);

  const loadProducts = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const data = await fetchProducts(pagination.page, pagination.limit, searchText, sortOrder);

      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      } else {
        message.error(data.message || 'Failed to fetch products');
        setProducts([]);
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
      console.error('Failed to load products:', error);
      message.error('Failed to load products.');
      setProducts([]);
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
    loadProducts();
  }, [pagination.page, pagination.limit, isAuthenticated, searchText, sortOrder]);

  const columns: ColumnsType<ProductDataType> = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: '5%',
      render: (_, record, index: number) => index + 1,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => (
        <Space size="middle">
          <Image src={record.imageUrl} alt={record.name} width={50} height={50} style={{ objectFit: 'cover' }} />
          <Space direction="vertical" size={0}>
            <Text>{record.name}</Text>
            <Text type="secondary" style={{ color: '#52c41a' }}>ID: {record.code}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Số dm²',
      dataIndex: 'sizeDm2',
      key: 'sizeDm2'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value, record) => moment(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value, record) => moment(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => {
            showModal(record._id);
          }} style={{ cursor: 'pointer', color: '#1677ff', textDecoration: "underline" }}>Xem</a>
          <a onClick={() => {
            showDeleteConfirm(record._id, record.name);
          }} style={{ cursor: 'pointer', color: '#001529', textDecoration: "underline" }}>In</a>
        </Space>
      ),
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));

    if (sorter.field === 'name' && sorter.order) {
      setSortOrder(sorter.order === 'ascend' ? 'name' : '-name');
    } else {
      setSortOrder(undefined);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const showModal = (productId?: string) => {
    setEditingProductId(productId);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProductId(undefined);
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
    setEditingProductId(undefined);
    loadProducts();
  };

  const showDeleteConfirm = (productId: string, productName: string) => {
    confirm({
      title: `Are you sure delete product ${productName}?`,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          const result = await deleteProduct(productId);
          if (result.success) {
            message.success(result.message || 'Product deleted successfully');
            loadProducts();
          } else {
            message.error(result.message || 'Failed to delete product');
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          message.error('An error occurred while deleting the product.');
        }
      },
      onCancel() {
        console.log('Delete cancelled');
      },
    });
  };

  const handleCreateNew = () => {
    showModal(undefined);
  };

  const handleExportExcel = async () => {
    try {
      const response = await downloadProductsExcel();
      if (response.success) {
        message.success(response.message || 'Tải xuống Excel thành công!');
      } else {
        message.error(response.message || 'Không thể tải xuống Excel.');
      }
    } catch (error) {
      console.error('Lỗi khi tải xuống Excel:', error);
      message.error('Đã xảy ra lỗi khi tải xuống Excel.');
    }
  };

  return (
    <div>
      <Title level={3}>Sản phẩm</Title>

      <Flex justify="space-between" style={{ marginBottom: 16 }}>
        <Search
          placeholder="Nhập mã hoặc tên sản phẩm để tìm kiếm"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ width: 350 }}
        />
        <Space>
          <Button type="default" style={{padding:16}} icon={<ExportOutlined />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Tạo mới
          </Button>
        </Space>
      </Flex>

      <Table
        columns={columns}
        dataSource={products.map(product => ({ ...product, key: product._id }))}
        loading={loading}
        pagination={{
          current: pagination.page || 1,
          pageSize: pagination.limit,
          total: pagination.totalDocs,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50', '100'],
        }}
        onChange={handleTableChange}
        rowKey="_id"
      />

      <ProductDetailForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
        productId={editingProductId}
      />
    </div>
  );
};

export default ProductsPage; 