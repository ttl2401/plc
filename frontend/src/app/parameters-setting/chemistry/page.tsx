"use client";

import React, { useEffect, useState, useRef } from "react";
import { fetchChemistrySettings, updateChemistrySettings } from "@/services/settingService";
import { Input, Typography, Spin, Button, Form, InputNumber, message } from "antd";

const { Title } = Typography;

const ChemistrySettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tanks, setTanks] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(false);
  const [progressValues, setProgressValues] = useState<{ [tankId: string]: number }>({});
  const progressTimers = useRef<{ [tankId: string]: NodeJS.Timeout | null | undefined}>({});

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

  useEffect(() => {
    // Set form initial values when tanks are loaded
    if (tanks.length > 0) {
      const values: any = {};
      const progress: any = {};
      tanks.forEach((tank) => {
        values[`AHToAdded_${tank._id}`] = tank.chemistry?.AHToAdded ?? 0;
        progress[tank._id] = tank.chemistry?.AHConsumed ?? 0;
        tank.chemistry?.pumps?.forEach((pump: any) => {
          values[`pumpTime_${tank._id}_${pump.pumpKey}`] = pump.time ?? 0;
        });
      });
      form.setFieldsValue(values);
      setProgressValues(progress);
    }
  }, [tanks, form]);

  // Helper for progress bar
  const renderProgress = (tankId: string, max: number) => {
    const value = progressValues[tankId] ?? 0;
    const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
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

  // Animate progress after update
  const animateProgress = (updatedList: any[]) => {
    setDisabled(true);
    const newProgress: any = {};
    updatedList.forEach((tank) => {
      newProgress[tank._id] = 0;
    });
    setProgressValues(newProgress);
    // Clear any previous timers
    for (const timer of Object.values(progressTimers.current)) {
      if (timer) clearTimeout(timer);
    }
    progressTimers.current = {};
    updatedList.forEach((tank) => {
      const max = tank.chemistry.AHToAdded;
      let current = 0;
      const tick = () => {
        setProgressValues((prev) => ({ ...prev, [tank._id]: current }));
        if (current < max) {
          current++;
          progressTimers.current[tank._id] = setTimeout(tick, 1000);
        } else {
          const timer = progressTimers.current[tank._id];
          if (timer != null) { // sẽ loại bỏ cả null và undefined
            clearTimeout(timer);
            progressTimers.current[tank._id] = null;
          }
          // When all tanks done, re-enable
          if (Object.values(progressTimers.current).every((timer) => !timer)) {
            setDisabled(false);
          }
        }
      };
      tick();
    });
  };

  const handleFinish = async (values: any) => {
    // Build updated list for API
    const updatedList = tanks.map((tank) => ({
      _id: tank._id,
      name: tank.name,
      chemistry: {
        AHToAdded: values[`AHToAdded_${tank._id}`],
        pumps: tank.chemistry.pumps.map((pump: any) => ({
          ...pump,
          time: values[`pumpTime_${tank._id}_${pump.pumpKey}`],
        })),
      },
    }));
    try {
      await updateChemistrySettings({ list: updatedList });
      message.success("Cập nhật thành công!");
      animateProgress(updatedList);
    } catch (e) {
      message.error("Cập nhật thất bại!");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;

  // Calculate split for right-first vertical order
  const split = Math.ceil(tanks.length / 2);
  const leftTanks = tanks.slice(0, split);
  const rightTanks = tanks.slice(split);
  const maxRows = Math.max(leftTanks.length, rightTanks.length);

  return (
    <div className="p-8 pt-0">
      <Title level={3} className="mb-6">CÀI ĐẶT BỔ SUNG HÓA CHẤT LỎNG</Title>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid grid-cols-2 gap-8">
          {/* Render as rows: right | left */}
          {Array.from({ length: maxRows }).map((_, idx) => (
            <React.Fragment key={idx}>
              {/* Right column (first) */}
              <div>
                {rightTanks[idx] && (
                  <div className="bg-white rounded-xl border p-6 mb-0">
                    <div className="flex flex-row items-center gap-6 mb-4">
                      <div className="text-lg font-bold min-w-[160px] max-w-[180px] flex-shrink-0">{rightTanks[idx].name}</div>
                      <div className="flex flex-row items-center border-2 border-green-400 rounded-xl px-6 py-2 gap-8 flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold text-sm mb-1">A/H Cần Bổ Sung</span>
                          <Form.Item name={`AHToAdded_${rightTanks[idx]._id}`} noStyle rules={[{ required: true, type: 'number', min: 0 }]}> 
                            <InputNumber min={0} className="w-32 h-8 text-center" disabled={disabled} />
                          </Form.Item>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold text-sm mb-1">A/H Cần Tiêu Thụ</span>
                          {renderProgress(rightTanks[idx]._id, form.getFieldValue(`AHToAdded_${rightTanks[idx]._id}`) || 0)}
                        </div>
                      </div>
                    </div>
                    {/* Pump blocks */}
                    {rightTanks[idx].chemistry?.pumps?.length === 3 ? (
                      <div className="flex flex-row gap-4">
                        {rightTanks[idx].chemistry.pumps.map((pump: any) => (
                          <div key={pump.pumpKey} className={`flex-1 rounded-lg border-2 ${pump.pumpType === 'electric' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'} p-4 flex flex-col items-center min-w-[120px]`}>
                            <div className={`font-bold mb-2 flex items-center gap-2 ${pump.pumpType === 'electric' ? 'text-yellow-700' : 'text-gray-700'}`}>
                              {pump.pumpType === 'electric' && <span className="text-md">⚡</span>}
                              {pump.pumpName}
                            </div>
                            <span className="text-sm mb-1">Thời gian bơm</span>
                            <Form.Item name={`pumpTime_${rightTanks[idx]._id}_${pump.pumpKey}`} noStyle rules={[{ required: true, type: 'number', min: 0 }]}> 
                              <InputNumber min={0} className="w-24 h-8 text-center" />
                            </Form.Item>
                          </div>
                        ))}
                      </div>
                    ) : rightTanks[idx].chemistry?.pumps?.length === 1 ? (
                      <div className="flex flex-col items-center mt-2">
                        {rightTanks[idx].chemistry.pumps.map((pump: any) => (
                          <div key={pump.pumpKey} className={`rounded-lg border-2 ${pump.pumpType === 'electric' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'} p-4 flex flex-col items-center min-w-[120px]`}> 
                            <div className={`font-bold mb-2 flex items-center gap-2 ${pump.pumpType === 'electric' ? 'text-yellow-700' : 'text-gray-700'}`}> 
                              {pump.pumpType === 'electric' && <span className="text-md">⚡</span>}
                              {pump.pumpName}
                            </div>
                            <span className="text-sm mb-1">Thời gian bơm</span>
                            <Form.Item name={`pumpTime_${rightTanks[idx]._id}_${pump.pumpKey}`} noStyle rules={[{ required: true, type: 'number', min: 0 }]}> 
                              <InputNumber min={0} className="w-32 h-8 text-center" />
                            </Form.Item>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              {/* Left column (second) */}
              <div>
                {leftTanks[idx] && (
                  <div className="bg-white rounded-xl border p-6 mb-0">
                    <div className="flex flex-row items-center gap-6 mb-4">
                      <div className="text-lg font-bold min-w-[160px] max-w-[180px] flex-shrink-0">{leftTanks[idx].name}</div>
                      <div className="flex flex-row items-center border-2 border-green-400 rounded-xl px-6 py-2 gap-8 flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold text-sm mb-1">A/H Cần Bổ Sung</span>
                          <Form.Item name={`AHToAdded_${leftTanks[idx]._id}`} noStyle rules={[{ required: true, type: 'number', min: 0 }]}> 
                            <InputNumber min={0} className="w-32 h-8 text-center" disabled={disabled} />
                          </Form.Item>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold text-sm mb-1">A/H Cần Tiêu Thụ</span>
                          {renderProgress(leftTanks[idx]._id, form.getFieldValue(`AHToAdded_${leftTanks[idx]._id}`) || 0)}
                        </div>
                      </div>
                    </div>
                    {/* Pump blocks */}
                    {leftTanks[idx].chemistry?.pumps?.length === 3 ? (
                      <div className="flex flex-row gap-4">
                        {leftTanks[idx].chemistry.pumps.map((pump: any) => (
                          <div key={pump.pumpKey} className={`flex-1 rounded-lg border-2 ${pump.pumpType === 'electric' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'} p-4 flex flex-col items-center min-w-[120px]`}>
                            <div className={`font-bold mb-2 flex items-center gap-2 ${pump.pumpType === 'electric' ? 'text-yellow-700' : 'text-gray-700'}`}>
                              {pump.pumpType === 'electric' && <span className="text-md">⚡</span>}
                              {pump.pumpName}
                            </div>
                            <span className="text-sm mb-1">Thời gian bơm</span>
                            <Form.Item name={`pumpTime_${leftTanks[idx]._id}_${pump.pumpKey}`} noStyle rules={[{ required: true, type: 'number', min: 0 }]}> 
                              <InputNumber min={0} className="w-24 h-8 text-center" />
                            </Form.Item>
                          </div>
                        ))}
                      </div>
                    ) : leftTanks[idx].chemistry?.pumps?.length === 1 ? (
                      <div className="flex flex-col items-center">
                        {leftTanks[idx].chemistry.pumps.map((pump: any) => (
                          <div key={pump.pumpKey} className={`flex-1 rounded-lg border-2 ${pump.pumpType === 'electric' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'} p-4 flex flex-col items-center min-w-[120px]`}> 
                            <div className={`font-bold mb-2 flex items-center gap-2 ${pump.pumpType === 'electric' ? 'text-yellow-700' : 'text-gray-700'}`}> 
                              {pump.pumpType === 'electric' && <span className="text-md">⚡</span>}
                              {pump.pumpName}
                            </div>
                            <span className="text-sm mb-1">Thời gian bơm</span>
                            <Form.Item name={`pumpTime_${leftTanks[idx]._id}_${pump.pumpKey}`} noStyle rules={[{ required: true, type: 'number', min: 0 }]}> 
                              <InputNumber min={0} className="w-24 h-8 text-center" />
                            </Form.Item>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="flex w-full justify-end mt-8">
          <Button type="primary" htmlType="submit" className="h-8 w-48 font-bold bg-black text-white border-black" disabled={disabled}>Áp dụng</Button>
        </div>
      </Form>
      <style jsx global>{`
        .ant-input-number-input {
          text-align: center!important;
        }
      `}
      </style>
    </div>
  );
};

export default ChemistrySettingsPage; 