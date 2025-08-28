import React, { useState, useEffect } from 'react';
import { Upload, App as AntdApp } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadImage } from '@/services/productService';

interface ImageUploadProps {
  src?: string | undefined;
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ src, value, onChange, style }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(src || '');
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setImageUrl(src || '');
  }, [src]);

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange: UploadProps['onChange'] = async (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.originFileObj) {
      try {
        const response = await uploadImage(info.file.originFileObj);
        if (response.success) {
          setImageUrl(response.data.fileUrl);
          onChange?.(response.data.filePath);
          message.success('Image uploaded successfully');
        } else {
          message.error(response.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        message.error('Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      name="image"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={({ file, onSuccess }) => {
        setTimeout(() => {
          onSuccess?.("ok");
        }, 0);
      }}
      style={style}
    >
      {imageUrl ? (
        <img
          src={`${imageUrl}`}
          alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        uploadButton
      )}
    </Upload>
  );
};

export default ImageUpload; 