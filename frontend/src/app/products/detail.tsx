"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Modal, Spin, Space, Tabs, Row, Col, Table, App as AntdApp } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProductById, createProduct, updateProduct, fetchProductChanges, ProductChange } from '@/services/productService';
import ImageUpload from '@/components/ImageUpload';
import { QRCodeSVG } from 'qrcode.react';
import moment from 'moment';

interface ProductDetailFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  productId?: string;
}

const ProductDetailForm: React.FC<ProductDetailFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  productId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [formEditable, setFormEditable] = useState(false);
  const [currentProductImage, setCurrentProductImage] = useState<string | undefined>(undefined);
  const [productChanges, setProductChanges] = useState<ProductChange[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');
  const { message } = AntdApp.useApp();
  
  const fetchProductData = async (productId:string) => {
    try {
      const data = await fetchProductById(productId);
      if (data.success) {
        form.setFieldsValue(data.data);
        setQrCodeValue(data.data.code);
        setCurrentProductImage(data.data.imageUrl);
        console.log("currentProductImage", currentProductImage)
      } else {
        message.error(data.message || 'Failed to fetch product data');
        onCancel();
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      message.error('Failed to fetch product data.');
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setActiveTabKey('1');
      if (productId) {
        setLoading(true);
        setFormEditable(false);
        fetchProductData(productId);
        fetchProductChangesData(productId);
      } else {
        form.resetFields();
        setQrCodeValue('');
        setFormEditable(true);
        setCurrentProductImage(undefined);
        setProductChanges([]);
      }
    }
  }, [visible, productId, form, onCancel]);

  const handleSubmit = async (values: any) => {
    if (!isAuthenticated) {
      message.error('You must be logged in to perform this action');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (productId) {
        response = await updateProduct(productId, values);
      } else {
        response = await createProduct(values);
      }

      if (response.success) {
        message.success(response.message || `${productId ? 'Sản phẩm đã được cập nhật' : 'Sản phẩm đã được tạo'} thành công`);
        onSuccess();
      } else {
        message.error(response.message || `Không thể ${productId ? 'cập nhật' : 'tạo'} sản phẩm`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      message.error('Đã xảy ra lỗi khi gửi sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrCodeValue(e.target.value);
  };

  const handleEditClick = () => {
    setFormEditable(true);
  };

  const handleCancelEdit = () => {
    if (productId) {
      setLoading(true);
      fetchProductById(productId).then(data => {
        if (data.success) {
          form.setFieldsValue(data.data);
          setQrCodeValue(data.data.code);
          setCurrentProductImage(data.data.imageUrl);
        } else {
          message.error(data.message || 'Failed to revert product data');
        }
      }).catch(error => {
        console.error('Error reverting product data:', error);
        message.error('An error occurred while reverting product data.');
      }).finally(() => {
        setLoading(false);
      });
      setFormEditable(false);
    } else {
      onCancel();
    }
  };

  const fetchProductChangesData = async (productId: string) => {
    setHistoryLoading(true);
    try {
      const data = await fetchProductChanges(productId);
      if (data.success) {
        setProductChanges(data.data);
      } else {
        message.error(data.message || 'Failed to fetch product changes');
        setProductChanges([]);
      }
    } catch (error) {
      console.error('Error fetching product changes:', error);
      message.error('Failed to fetch product changes.');
      setProductChanges([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns: ColumnsType<ProductChange> = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: '5%',
      render: (_, record, index: number) => index + 1,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => moment(value).format('DD/MM/YYYY [lúc] HH:mm'),
    },
    {
      title: 'Người thực hiện',
      dataIndex: ['user', 'name'],
      key: 'userName',
    },
  ];

  const renderFormContent = () => (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={!formEditable}
      >
        <Row gutter={[16, 16]}>
          <Col span={10}>
            <Form.Item
              name="image"
              label="Hình ảnh"
            >
              <ImageUpload 
                src={currentProductImage}
                value={form.getFieldValue('image')} 
                onChange={(path) => form.setFieldsValue({ image: path })} 
                style={{ width: 200, height: 200 }}
              />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              name="code"
              label="Mã sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
            >
              <Input placeholder="Nhập mã sản phẩm" onChange={handleCodeChange} disabled={!!productId} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên sản phẩm"
            >
              <Input placeholder="Nhập tên sản phẩm" disabled={!formEditable} />
            </Form.Item>

            <Form.Item
              name="sizeDm2"
              label="Kích thước (dm²)"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Nhập kích thước"
                disabled={!formEditable}
              />
            </Form.Item>

            <Form.Item label="Mã QR">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                {qrCodeValue && (
                  <QRCodeSVG
                    value={qrCodeValue}
                    size={150}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </Space>
            </Form.Item>

            <Form.Item name="qrCode" hidden>
              <Input type="hidden" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Spin>
  );

  const items = [
    {
      key: '1',
      label: 'Thông tin sản phẩm',
      children: renderFormContent(),
    },
    {
      key: '2',
      label: 'Lịch sử thay đổi',
      children: <Table columns={columns} dataSource={productChanges.map((change, index) => ({...change, key: change._id || index }))} pagination={false} loading={historyLoading} />,
    },
  ];

  return (
    <Modal
      title="Chi tiết sản phẩm"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      maskClosable={false}
    >
      <Tabs defaultActiveKey="1" items={items} onChange={setActiveTabKey} />

      {activeTabKey === '1' && (
        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          {productId && !formEditable ? (
            <>
              <Button onClick={handleEditClick} style={{ marginRight: 8 }}>
                Sửa
              </Button>
              <Button type="primary">In thông tin</Button>
            </>)
            : (productId && formEditable ? (
              <>
                <Button onClick={handleCancelEdit} style={{ marginRight: 8 }}>
                  Hủy bỏ
                </Button>
                <Button type="primary" onClick={() => form.submit()} loading={submitting}>
                  Áp dụng
                </Button>
              </>)
              : (
                <>
                  <Button onClick={onCancel} style={{ marginRight: 8 }}>
                    Hủy bỏ
                  </Button>
                  <Button type="primary" onClick={() => form.submit()} loading={submitting}>
                    Áp dụng
                  </Button>
                </>
              )
            )}
        </div>
      )}
    </Modal>
  );
};

export default ProductDetailForm; 