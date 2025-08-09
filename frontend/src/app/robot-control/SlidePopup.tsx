"use client";

import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useLanguage } from '@/components/layout/DashboardLayout';

interface SlidePopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  branchNumber: number;
}

const SlidePopup: React.FC<SlidePopupProps> = ({ visible, onClose, onConfirm, branchNumber }) => {
  const { t } = useLanguage();
  const [isSliding, setIsSliding] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);

  const handleSlideStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsSliding(true);
    e.preventDefault();
  };

  const handleSlideMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSliding) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newPosition = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSlidePosition(newPosition);

    if (newPosition > 80) {
      setIsSliding(false);
      setSlidePosition(0);
      onConfirm();
    }
  };

  const handleSlideEnd = () => {
    setIsSliding(false);
    setSlidePosition(0);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      title={null}
      closable={false}
      maskClosable={true}
      style={{ borderRadius: 16 }}
    >
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 32 }}>
          {t('robot_control_emergency_confirm_title').replace('{branch}', branchNumber.toString())}
        </h2>
        
        <div
          style={{
            position: 'relative',
            width: '80%',
            marginLeft: '10%',
            height: 60,
            background: '#f0f0f0',
            borderRadius: 30,
            border: '2px solid #d9d9d9',
            marginBottom: 24,
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          onMouseDown={handleSlideStart}
          onMouseMove={handleSlideMove}
          onMouseUp={handleSlideEnd}
          onMouseLeave={handleSlideEnd}
          onTouchStart={handleSlideStart}
          onTouchMove={handleSlideMove}
          onTouchEnd={handleSlideEnd}
        >
          <div
            style={{
              position: 'absolute',
              left: `${slidePosition}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 56,
              height: 56,
              background: '#ff4d4f',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: isSliding ? 'none' : 'left 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <ArrowRightOutlined style={{ color: 'white', fontSize: 20 }} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#666',
              fontSize: 16,
              fontWeight: 500,
              pointerEvents: 'none'
            }}
          >
            {t('robot_control_slide_to_stop')}
          </div>
        </div>

        <Button
          onClick={onClose}
          size="large"
          style={{
            borderRadius: 8,
            padding: '8px 32px',
            height: 'auto'
          }}
        >
          {t('cancel')}
        </Button>
      </div>
    </Modal>
  );
};

export default SlidePopup;
