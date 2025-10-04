"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchInformationTimerDetail, NewTimerTankInfo, NewInformationTimer } from "@/services/informationService";
import { Select, Spin, Typography, message } from "antd";
import dayjs from "dayjs";
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;

const getTankDisplayName = (tank: NewTimerTankInfo) => {
  return tank.tank.name;
};

const getTankColor = (groupKey: string) => {
  switch (groupKey) {
    case "washing": return "#E8E8E8";
    case "boiling_degreasing": return "#F5F7FA";
    case "electro_degreasing": return "#D1F2EB";
    case "pre_nickel_plating": return "#FCF3CF";
    case "nickel_plating": return "#D6EAF8";
    case "ultrasonic_hot_rinse": return "#FDEDEC";
    case "hot_rinse": return "#FADBD8";
    case "dryer": return "#E8DAEF";
    case "loading_station": return "#F5F7FA";
    case "cross_transporter": return "#D1F2EB";
    case "storage": return "#FCF3CF";
    default:
      return "#F5F7FA";
  }
};

const formatTime = (iso?: string | null) => {
  if (!iso) return '-';
  const d = dayjs(iso);
  if (!d.isValid()) return '-';
  return d.format('HH:mm:ss');
};

const calcDurationSeconds = (enterIso?: string | null, exitIso?: string | null) => {
  if (!enterIso || !exitIso) return '-';
  const a = dayjs(exitIso);
  const b = dayjs(enterIso);
  if (!a.isValid() || !b.isValid()) return '-';
  return a.unix() - b.unix();
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatDurationDisplay = (val: any) => {
  if (val === '-' || val == null) return '-';
  const seconds = Number(val);
  if (!Number.isFinite(seconds) || seconds < 0) return '-';
  if (seconds < 60) return `${seconds}`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${pad2(m)}:${pad2(s)}`;
  }
  const h = Math.floor(seconds / 3600);
  const rem = seconds % 3600;
  const m = Math.floor(rem / 60);
  const s = rem % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

const TimerDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const params = useParams();
  const code = params?.code as string;
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<NewInformationTimer | null>(null);
  const [selectedTankId, setSelectedTankId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    let payload: { code: string; carrierPick?: number } | null = null;
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(code)));
      if (decoded && typeof decoded === 'object' && decoded.code) {
        payload = { code: decoded.code, carrierPick: decoded.carrierPick };
      }
    } catch {}

    const queryCode = payload?.code || code;
    const carrierPick = payload?.carrierPick;

    fetchInformationTimerDetail(queryCode, carrierPick)
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

  // Filter tanks that have both enteredAt and exitedAt
  const validTanks = timer?.tanks.filter(tank => tank.enteredAt && tank.exitedAt) || [];
  
  // Get dropdown options from valid tanks
  const tankOptions = validTanks.map(tank => ({
    value: tank.tankId,
    label: tank.tank.name
  }));

  // Filter tanks based on selection
  const displayTanks = selectedTankId 
    ? validTanks.filter(tank => tank.tankId === selectedTankId)
    : validTanks;

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
            <div>
              <span className="font-semibold">{t('product_code')} </span>
              <span style={{ color: 'limegreen' }} className="font-bold text-lg">{timer.productCode}</span>
            </div>
            <div>
              <span className="font-semibold">Carrier Pick: </span>
              <span style={{ color: 'blue' }} className="font-bold text-lg">{timer.carrierPick}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Chọn Hồ:</span>
              <Select
                style={{ minWidth: 200 }}
                placeholder="Tất cả hồ"
                allowClear
                value={selectedTankId}
                onChange={setSelectedTankId}
                options={tankOptions}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayTanks.map((tank, idx) => (
              <div
                key={idx}
                className="rounded-lg shadow border flex flex-col items-center p-3 bg-white"
                style={{ borderTop: `4px solid ${getTankColor(tank.tank.groupKey)}` }}
              >
                <div className="w-full text-center font-bold text-lg bg-slate-800 text-white rounded-t-md py-2 mb-2">
                  {getTankDisplayName(tank)}
                </div>
                <div className="flex flex-row w-full justify-between gap-2">
                  <div className="flex-1 bg-green-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-500">{t('time_in')}</div>
                    <div className="text-base">{formatTime(tank.enteredAt)}</div>
                  </div>
                  <div className="flex-1 bg-yellow-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-500">{t('duration')}</div>
                    <div className="text-base">{formatDurationDisplay(calcDurationSeconds(tank.enteredAt, tank.exitedAt))}</div>
                  </div>
                  <div className="flex-1 bg-blue-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-500">{t('time_out')}</div>
                    <div className="text-base">{formatTime(tank.exitedAt)}</div>
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