"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, message, Modal, Spin, Space, Tabs, Row, Col } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProductById, createProduct, updateProduct } from '@/services/productService';
import ImageUpload from '@/components/ImageUpload';
import { QRCodeSVG } from 'qrcode.react';

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
      if (productId) {
        setLoading(true);
        setFormEditable(false);
        fetchProductData(productId);
      } else {
        form.resetFields();
        setQrCodeValue('');
        setFormEditable(true);
        setCurrentProductImage(undefined);
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
              rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh' }]}
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
              <Input placeholder="Nhập mã sản phẩm" onChange={handleCodeChange} disabled={!formEditable} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Nhập tên sản phẩm" disabled={!formEditable} />
            </Form.Item>

            <Form.Item
              name="sizeDm2"
              label="Kích thước (dm²)"
              rules={[{ required: true, message: 'Vui lòng nhập kích thước' }]}
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
      children: <div>Content for History Tab</div>,
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
      <Tabs defaultActiveKey="1" items={items} />

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
    </Modal>
  );
};

export default ProductDetailForm; 