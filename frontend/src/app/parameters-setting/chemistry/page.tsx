"use client";

import React, { useEffect, useState } from "react";
import { fetchChemistrySettings } from "@/services/settingService";
import { Input, Typography, Spin, Button } from "antd";

const { Title } = Typography;

const ChemistrySettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tanks, setTanks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchChemistrySettings();
        setTanks(res.data || []);
      } catch (err) {
        setTanks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;

  // Helper for progress bar
  const renderProgress = (value: number, max: number) => {
    const percent = Math.min(100, Math.round((value / max) * 100));
    return (
      <div className="flex flex-row items-center gap-2">
        <span className="text-green-600 font-bold">{value}</span>
        <div className="flex-1 min-w-[80px] max-w-[120px] h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-gray-500 font-semibold">{max}</span>
      </div>
    );
  };

  // Calculate split for right-first vertical order
  const split = Math.ceil(tanks.length / 2);
  const leftTanks = tanks.slice(0, split);
  const rightTanks = tanks.slice(split);
  const maxRows = Math.max(leftTanks.length, rightTanks.length);

  return (
    <div className="p-8 pt-0">
      <Title level={2} className="mb-6">CÀI ĐẶT BỔ SUNG HÓA CHẤT LỎNG</Title>
      <div className="grid grid-cols-2 gap-8">
        {/* Render as rows: right | left */}
        {Array.from({ length: maxRows }).map((_, idx) => (
          <React.Fragment key={idx}>
            {/* Right column (first) */}
            <div>
              {rightTanks[idx] && (
                <div className="bg-white rounded-xl border p-6 mb-0">
                  <div className="text-xl font-bold mb-2">{rightTanks[idx].name}</div>
                  <div className="flex flex-row items-center gap-8 mb-4">
                    <div className="flex flex-col items-center flex-1">
                      <span className="font-bold text-sm mb-1">A/H Cần Bổ Sung</span>
                      <Input value={rightTanks[idx].chemistry?.AHToAdded ?? 0} className="w-32 h-12 text-center text-lg font-bold" min={0} type="number" disabled />
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="font-bold text-sm mb-1">A/H Cần Tiêu Thụ</span>
                      {renderProgress(rightTanks[idx].chemistry?.AHConsumed ?? 0, 1000)}
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    {rightTanks[idx].chemistry?.pumps?.map((pump: any) => (
                      <div key={pump.pumpKey} className={`flex-1 rounded-lg border-2 ${pump.pumpType === 'electric' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'} p-4 flex flex-col items-center`}>
                        <div className={`font-bold mb-2 flex items-center gap-2 ${pump.pumpType === 'electric' ? 'text-yellow-700' : 'text-gray-700'}`}>
                          {pump.pumpType === 'electric' && <span className="text-lg">⚡</span>}
                          {pump.pumpName}
                        </div>
                        <span className="text-sm mb-1">Thời gian bơm</span>
                        <Input value={pump.time} className="w-24 h-12 text-center text-lg font-bold" min={0} type="number" disabled />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Left column (second) */}
            <div>
              {leftTanks[idx] && (
                <div className="bg-white rounded-xl border p-6 mb-0">
                  <div className="text-xl font-bold mb-2">{leftTanks[idx].name}</div>
                  <div className="flex flex-row items-center gap-8 mb-4">
                    <div className="flex flex-col items-center flex-1">
                      <span className="font-bold text-sm mb-1">A/H Cần Bổ Sung</span>
                      <Input value={leftTanks[idx].chemistry?.AHToAdded ?? 0} className="w-32 h-12 text-center text-lg font-bold" min={0} type="number" disabled />
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="font-bold text-sm mb-1">A/H Cần Tiêu Thụ</span>
                      {renderProgress(leftTanks[idx].chemistry?.AHConsumed ?? 0, 1000)}
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    {leftTanks[idx].chemistry?.pumps?.map((pump: any) => (
                      <div key={pump.pumpKey} className={`flex-1 rounded-lg border-2 ${pump.pumpType === 'electric' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'} p-4 flex flex-col items-center`}>
                        <div className={`font-bold mb-2 flex items-center gap-2 ${pump.pumpType === 'electric' ? 'text-yellow-700' : 'text-gray-700'}`}>
                          {pump.pumpType === 'electric' && <span className="text-lg">⚡</span>}
                          {pump.pumpName}
                        </div>
                        <span className="text-sm mb-1">Thời gian bơm</span>
                        <Input value={pump.time} className="w-24 h-12 text-center text-lg font-bold" min={0} type="number" disabled />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="flex w-full justify-end mt-8">
        <Button type="primary" className="h-12 w-48 text-lg font-bold bg-black text-white border-black">Áp dụng</Button>
      </div>
    </div>
  );
};

export default ChemistrySettingsPage; 