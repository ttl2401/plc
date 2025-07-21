"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchInformationTimerDetail, TimerTankInfo } from "@/services/informationService";
import { Select, Spin, Typography, message } from "antd";
import dayjs from "dayjs";
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;

const getTankDisplayName = (tank: TimerTankInfo) => {
  // Cascade rinse tanks have slot in name
  if (tank.name === "cascade_rinse" && tank.slot) {
    return `Cascade Rinse ${tank.code.split('_').pop()}`;
  }
  // Other tanks
  return tank.name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getTankColor = (name: string) => {
  switch (name) {
    case "washing": return "#F5F7FA";
    case "boiling_degreasing": return "#F5F7FA";
    case "electro_degreasing": return "#D1F2EB";
    case "pre_nickel_plating": return "#FCF3CF";
    case "nickel_plating": return "#D6EAF8";
    case "ultrasonic_hot_rinse": return "#FDEDEC";
    case "hot_rinse": return "#FADBD8";
    case "dryer": return "#E8DAEF";
    case "activation": return "#F9E79F";
    default:
      if (name.startsWith("cascade_rinse")) return "#D6EAF8";
      return "#F5F7FA";
  }
};

const TimerDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const params = useParams();
  const code = params?.code as string;
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<{ code: string; tanks: TimerTankInfo[] } | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetchInformationTimerDetail(code)
      .then((res) => {
        if (res.success) {
          setTimer(res.data);
        } else {
          message.error(res.message || "Không thể tải dữ liệu");
        }
      })
      .catch(() => message.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="pt-0">
      <Title level={3} className="mb-4">{t('timer_information')}</Title>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : timer ? (
        <>
          <div className="flex flex-row gap-6 items-center mb-6">
            {/* You can add a Select for tank group filter here if needed */}
            <div>
              <span className="font-semibold">{t('product_code')} </span>
              <span className="text-green-600 font-bold text-lg">{timer.code}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {timer.tanks.map((tank, idx) => (
              <div
                key={idx}
                className="rounded-lg shadow border flex flex-col items-center p-3 bg-white"
                // Remove background color style
              >
                <div className="w-full text-center font-bold text-lg bg-slate-800 text-white rounded-t-md py-2 mb-2">
                  {tank.name}
                </div>
                <div className="flex flex-row w-full justify-between gap-2">
                  <div className="flex-1 bg-gray-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-500">{t('time_in')}</div>
                    <div className="text-base">{tank.timeIn ? dayjs.unix(tank.timeIn).format("HH:mm:ss") : '-'}</div>
                  </div>
                  <div className="flex-1 bg-yellow-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-500">{t('duration')}</div>
                    <div className="text-base">{tank.timeIn && tank.timeOut ? (tank.timeOut - tank.timeIn) : '-'}</div>
                  </div>
                  <div className="flex-1 bg-blue-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-500">{t('time_out')}</div>
                    <div className="text-base">{tank.timeOut ? dayjs.unix(tank.timeOut).format("HH:mm:ss") : '-'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">{t('no_data')}</div>
      )}
    </div>
  );
};

export default TimerDetailPage; 