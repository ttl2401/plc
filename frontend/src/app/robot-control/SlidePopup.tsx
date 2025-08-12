"use client";

import React, { useEffect, useState } from 'react';
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
  const [slidePosition, setSlidePosition] = useState(0); // 0 -> 100
  const [completed, setCompleted] = useState(false);     // đã kéo xong và khóa ở cuối

  // Mỗi lần mở modal mới thì reset
  useEffect(() => {
    if (visible) {
      setIsSliding(false);
      setSlidePosition(0);
      setCompleted(false);
    }
  }, [visible]);

  const handleSlideStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (completed) return; // đã hoàn tất thì bỏ qua
    setIsSliding(true);
    e.preventDefault();
  };

  const handleSlideMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSliding || completed) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newPosition = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSlidePosition(newPosition);

    // Ngưỡng hoàn tất (có thể chỉnh 80 -> 90/95 tùy cảm giác)
    if (newPosition >= 80) {
      // Khóa ở cuối, không cho "giật về"
      setIsSliding(false);
      setCompleted(true);
      setSlidePosition(85);
      onConfirm(); // gọi API/hành động xác nhận
    }
  };

  const handleSlideEnd = () => {
    // Nếu đã hoàn tất thì giữ nguyên ở 100%
    if (completed) return;

    // Chưa hoàn tất -> trả về 0
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
            cursor: completed ? 'default' : 'pointer',
            overflow: 'hidden',
            userSelect: 'none'
          }}
          // Chỉ gắn handler khi chưa completed để tránh kéo lại
          onMouseDown={completed ? undefined : handleSlideStart}
          onMouseMove={completed ? undefined : handleSlideMove}
          onMouseUp={completed ? undefined : handleSlideEnd}
          onMouseLeave={completed ? undefined : handleSlideEnd}
          onTouchStart={completed ? undefined : handleSlideStart}
          onTouchMove={completed ? undefined : handleSlideMove}
          onTouchEnd={completed ? undefined : handleSlideEnd}
        >
          {/* Fill progress */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${slidePosition}%`,
              background: '#ffe1e1'
            }}
          />

          {/* Knob */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${slidePosition}% - 28px)`, // trừ nửa width để tâm knob đúng vị trí
              top: '50%',
              transform: 'translateY(-50%)',
              width: 56,
              height: 56,
              background: completed ? '#52c41a' : '#ff4d4f', // khi xong chuyển xanh cho rõ
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              marginLeft: 30,
              justifyContent: 'center',
              transition: isSliding ? 'none' : 'left 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              pointerEvents: 'none' // knob không nhận sự kiện (container nhận)
            }}
          >
            <ArrowRightOutlined style={{ color: 'white', fontSize: 20 }} />
          </div>

          {/* Label */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#666',
              fontSize: 16,
              fontWeight: 500,
              pointerEvents: 'none',
              opacity: completed ? 0 : 1,
              transition: 'opacity 0.2s ease'
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
