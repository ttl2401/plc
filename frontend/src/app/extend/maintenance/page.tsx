"use client";
import React, { useEffect, useState, useRef } from 'react';
import { fetchMaintenanceSetting, updateSettingMaintenance } from '@/services/systemSettingService';
import dayjs from 'dayjs';
import { useLanguage } from '@/components/layout/DashboardLayout';
import { Card, Button, Typography } from 'antd';

const ACTIVE_GREEN = 'limegreen';
const RED = '#FF0000';
const { Title } = Typography;

function formatCountdown(diff: number) {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
}

export default function MaintenancePage() {
  const { t } = useLanguage();
  const [setting, setSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [countdown, setCountdown] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMaintenanceSetting().then((res) => {
      setSetting(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!setting || !setting.value) return;
    const target = dayjs(setting.value, 'YYYY-MM-DD HH:mm:ss');
    if (target.isAfter(dayjs())) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const updateCountdown = () => {
        const now = dayjs();
        const diff = target.valueOf() - now.valueOf();
        if (diff <= 0) {
          setCountdown('0 ngày 0 giờ 0 phút 0 giây');
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setCountdown(formatCountdown(diff));
        }
      };
      updateCountdown();
      intervalRef.current = setInterval(updateCountdown, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    // Ensure a void return if the condition is not met
    return undefined;
  }, [setting]);

  const handleCardClick = () => {
    setInputValue(setting?.value ? dayjs(setting.value, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss') : '');
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    if (!inputValue) return;
    const formatted = dayjs(inputValue).format('YYYY-MM-DD HH:mm:ss');
    await updateSettingMaintenance(formatted);
    setShowPopup(false);
    setLoading(true);
    fetchMaintenanceSetting().then((res) => {
      setSetting(res.data);
      setLoading(false);
    });
  };

  let display;
  let color = '';
  if (loading) {
    display = t('loading');
  } else if (!setting || setting.value === null) {
    display = t('click_to_setting');
    color = '';
  } else {
    const target = dayjs(setting.value, 'YYYY-MM-DD HH:mm:ss');
    if (target.isAfter(dayjs())) {
      display = countdown;
      color = RED;
    } else {
      display = target.format('DD-MM-YYYY HH:mm:ss');
      color = ACTIVE_GREEN;
    }
  }

  return (
    <div className="pt-0">
      <Title level={3}>{t('maintenance_notice')}</Title>
      <div className="flex items-start h-[60vh]">
        <Card
          className="rounded-xl shadow flex flex-col items-center w-[400px] cursor-pointer border hover:shadow-lg transition"
          style={{ marginLeft: 0 }}
          onClick={handleCardClick}
          bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}
        >
          <div className="text-xl font-bold mb-2">{t('maintenance_filter_clean')}</div>
          <div className="text-2xl font-bold mb-6" style={{ color }}>{display}</div>
          <Button
            className="bg-[#181F2B] text-white rounded-lg px-12 py-3 text-lg font-semibold mt-2"
            style={{ background: '#181F2B', color: 'white', borderRadius: 12, fontSize: 18, fontWeight: 600, padding: '12px 48px', marginTop: 8 }}
          >
            {t('maintenance_confirm')}
          </Button>
        </Card>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 min-w-[340px] flex flex-col items-center">
            <label className="text-base font-semibold mb-2">{t('choose_time')}</label>
            <input
              type="datetime-local"
              className="border-b w-full mb-6 px-2 py-1 outline-none"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="dd/mm/yyyy HH:MM:SS"
            />
            <div className="flex gap-4 w-full justify-between mt-2">
              <Button
                className="border rounded px-6 py-2 font-semibold"
                onClick={() => setShowPopup(false)}
              >{t('cancel')}</Button>
              <Button
                className="bg-[#181F2B] text-white rounded px-6 py-2 font-semibold"
                style={{ background: '#181F2B', color: 'white', borderRadius: 8, fontWeight: 600 }}
                onClick={handleConfirm}
              >{t('maintenance_confirm')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 