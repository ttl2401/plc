"use client";

import React, { useEffect, useState } from 'react';
import { Table, Typography, message, Input, Button, Space, Flex, Modal, Image } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProducts, deleteProduct, type ProductDataType, downloadProductsExcel } from '@/services/productService';
import { SearchOutlined, PlusOutlined, ExportOutlined, QrcodeOutlined } from '@ant-design/icons';
import ProductDetailForm from './detail';
import moment from 'moment';
import { useLanguage } from '@/components/layout/DashboardLayout';
import dynamic from 'next/dynamic';

// Dynamically import QRScanner to avoid SSR issues
const QRScanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { ssr: false });

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
  const { t } = useLanguage();
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');

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
      title: t('product'),
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
            <Text type="secondary" style={{ color: 'limegreen' }}>{t('product_code')}: {record.code}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: t('product_size_dm2'),
      dataIndex: 'sizeDm2',
      key: 'sizeDm2'
    },
    {
      title: t('created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value, record) => moment(value).format('DD/MM/YYYY'),
    },
    {
      title: t('updated_at'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value, record) => moment(value).format('DD/MM/YYYY'),
    },
    {
      title: t('action'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => {
            showModal(record._id);
          }} style={{ cursor: 'pointer', color: '#1677ff', textDecoration: "underline" }}>{t('view')}</a>
          <a onClick={() => {
            showDeleteConfirm(record._id, record.name);
          }} style={{ cursor: 'pointer', color: '#001529', textDecoration: "underline" }}>{t('print')}</a>
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

  const handleScanClick = () => {
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  const handleScan = async (result: any) => {
    if (result && result[0] && result[0].rawValue) {
      setSearchText(result[0].rawValue);
      setScannerOpen(false);
    }
  };

  return (
    <div className="pt-0">
      {/* QR Scanner Popup */}
      {scannerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'relative',
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 4px 24px #00000022',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 320,
            minHeight: 320,
          }}>
            <button
              onClick={handleCloseScanner}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: '#ff2d2d',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
              aria-label="Đóng camera"
            >
              ×
            </button>
            <div style={{ width: 320, height: 240, borderRadius: 8, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QRScanner
                onScan={handleScan}
                onError={(error) => console.error("Error:", error)}
                constraints={{ facingMode: 'environment' }}
                styles={{
                  container: { width: 320, height: 240 },
                  video: { width: 320, height: 240, objectFit: 'cover', borderRadius: 8 },
                }}
              />
            </div>
            <div style={{ marginTop: 16, fontWeight: 500 }}>Đưa thẻ vào vùng quét</div>
            {scannerError && (
              <div style={{ color: 'red', marginTop: 12, fontWeight: 500, textAlign: 'center' }}>
                {scannerError}
              </div>
            )}
          </div>
        </div>
      )}

      <Title level={3}>{t('product_list')}</Title>

      <Flex justify="space-between" style={{ marginBottom: 16 }}>
        <Search
          placeholder={t('search_product_placeholder')}
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ width: 350 }}
          suffix={
            <QrcodeOutlined 
              style={{ fontSize: 22, color: '#6b7280', cursor: 'pointer' }} 
              onClick={handleScanClick}
            />
          }
        />
        <Space>
          <Button type="default" style={{padding:16}} icon={<ExportOutlined />} onClick={handleExportExcel}>
            {t('export_excel')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            {t('create_new')}
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