"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  fetchChemistrySettings, 
  updateChemistrySettings,
  type ChemistryItem,
  type TankChemistry
} from "@/services/settingService";
import { Typography, Spin, Button, Form, InputNumber, message } from "antd";
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;

const ChemistrySettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [tanks, setTanks] = useState<TankChemistry[]>([]);
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressValues, setProgressValues] = useState<{ [tankId: number]: number }>({});
  const progressTimers = useRef<{ [tankId: number]: NodeJS.Timeout | null | undefined}>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchChemistrySettings();
        // Filter out disabled tanks
        const activeTanks = (res.data || []).filter((tank: TankChemistry) => !tank.disable);
        setTanks(activeTanks);
      } catch (err) {
        setTanks([]);
        message.error(t('cannot_load_chemistry_data'));
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
        tank.chemistryList.forEach((item) => {
          // Set value for each chemistry item
          values[`chem_${tank.tankId}_${item._id}`] = item.value ?? 0;
          
          // Track progress for AH_tieuthu (consumed)
          if (item.note === 'AH_tieuthu') {
            progress[tank.tankId] = item.value ?? 0;
          }
        });
      });
      
      form.setFieldsValue(values);
      setProgressValues(progress);
    }
  }, [tanks, form]);

  // Helper for progress bar
  const renderProgress = (tankId: number, max: number) => {
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
  const animateProgress = (updatedTanks: TankChemistry[]) => {
    setDisabled(true);
    const newProgress: any = {};
    
    // Reset progress to 0 for all tanks
    updatedTanks.forEach((tank) => {
      newProgress[tank.tankId] = 0;
    });
    setProgressValues(newProgress);
    
    // Clear any previous timers
    for (const timer of Object.values(progressTimers.current)) {
      if (timer) clearTimeout(timer);
    }
    progressTimers.current = {};
    
    // Start animation for each tank
    updatedTanks.forEach((tank) => {
      // Find AH_bosung (to add) value for max
      const ahBosungItem = tank.chemistryList.find(item => item.note === 'AH_bosung');
      const max = ahBosungItem ? form.getFieldValue(`chem_${tank.tankId}_${ahBosungItem._id}`) : 0;
      
      let current = 0;
      const tick = () => {
        setProgressValues((prev) => ({ ...prev, [tank.tankId]: current }));
        if (current < max) {
          current++;
          progressTimers.current[tank.tankId] = setTimeout(tick, 1000);
        } else {
          const timer = progressTimers.current[tank.tankId];
          if (timer != null) {
            clearTimeout(timer);
            progressTimers.current[tank.tankId] = null;
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
    // Build updated list for API - send updated chemistry items
    const updatedList: any[] = [];
    
    tanks.forEach((tank) => {
      tank.chemistryList.forEach((item) => {
        const fieldName = `chem_${tank.tankId}_${item._id}`;
        if (values[fieldName] !== undefined) {
          updatedList.push({
            name: item.name,
            value: values[fieldName]
          });
        }
      });
    });
    
    setSubmitting(true);
    try {
      await updateChemistrySettings({ list: updatedList });
      message.success(t('update_success'));
      animateProgress(tanks);
    } catch (e) {
      message.error(t('update_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render a single tank block
  const renderTankBlock = (tank: TankChemistry) => {
    // Get chemistry items by type
    const ahBosungItem = tank.chemistryList.find(item => item.note === 'AH_bosung');
    const ahTieuthuItem = tank.chemistryList.find(item => item.note === 'AH_tieuthu');
    const bomAutoItems = tank.chemistryList.filter(item => item.note === 'AH_bom_auto');
    const bomItem = tank.chemistryList.find(item => item.note === 'AH_bom');

    // Combine all pump items
    const pumpItems = [...bomAutoItems, bomItem].filter(Boolean) as ChemistryItem[];
    
    // Check if there are any AH inputs
    const hasAHInputs = ahBosungItem || ahTieuthuItem;

    return (
      <div className="bg-white rounded-xl border p-6 mb-0">
        {/* Tank header with AH section */}
        <div className="flex flex-row items-center gap-6 mb-4">
          <div className="text-lg font-bold min-w-[160px] max-w-[180px] flex-shrink-0">
            {tank.tank.name}
          </div>
          {hasAHInputs ? (
            <div className="flex flex-row items-center border-2 border-green-400 rounded-xl px-6 py-2 gap-8 flex-1 min-h-[60px]">
              {ahBosungItem && (
                <div className="flex flex-col items-center flex-1">
                  <span className="font-bold text-sm mb-1">{t('ah_to_add')}</span>
                  <Form.Item 
                    name={`chem_${tank.tankId}_${ahBosungItem._id}`} 
                    noStyle 
                    rules={[{ required: true, type: 'number', min: 0 }]}
                  > 
                    <InputNumber min={0} className="w-32 h-8 text-center" disabled={disabled || submitting} />
                  </Form.Item>
                </div>
              )}
              {ahTieuthuItem && ahBosungItem && (
                <div className="flex flex-col items-center flex-1">
                  <span className="font-bold text-sm mb-1">{t('ah_to_consume')}</span>
                  {renderProgress(
                    tank.tankId, 
                    form.getFieldValue(`chem_${tank.tankId}_${ahBosungItem._id}`) || 0
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-[60px]"></div>
          )}
        </div>

        {/* Pump blocks */}
        {pumpItems.length > 0 && (
          <div className={`flex ${pumpItems.length === 1 ? 'flex-col items-center' : 'flex-row'} gap-4`}>
            {pumpItems.map((pumpItem, idx) => {
              const isElectric = pumpItem.note === 'AH_bom_auto';
              const electricIndex = isElectric ? bomAutoItems.indexOf(pumpItem) + 1 : null;
              const pumpLabel = isElectric 
                ? (bomAutoItems.length > 1 ? `${t('electric_pump')} ${electricIndex}` : t('electric_pump'))
                : t('non_electric_pump');

              return (
                <div 
                  key={pumpItem._id} 
                  className={`${pumpItems.length > 1 ? 'flex-1' : ''} rounded-lg border-2 ${
                    isElectric ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'
                  } p-4 flex flex-col items-center min-w-[120px]`}
                >
                  <div className={`font-bold mb-2 flex items-center gap-2 ${
                    isElectric ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    {isElectric && <span className="text-md">⚡</span>}
                    {pumpLabel}
                  </div>
                  <span className="text-sm mb-1">{t('pump_time')}</span>
                  <Form.Item 
                    name={`chem_${tank.tankId}_${pumpItem._id}`} 
                    noStyle 
                    rules={[{ required: true, type: 'number', min: 0 }]}
                  > 
                    <InputNumber min={0} className="w-24 h-8 text-center" disabled={submitting} />
                  </Form.Item>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;

  // Calculate split for right-first vertical order
  const split = Math.ceil(tanks.length / 2);
  const leftTanks = tanks.slice(0, split);
  const rightTanks = tanks.slice(split);
  const maxRows = Math.max(leftTanks.length, rightTanks.length);

  return (
    <div className="pt-0">
      <Title level={3} className="mb-6">{t('chemistry_setting_title')}</Title>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid grid-cols-2 gap-8">
          {/* Render as rows: right | left */}
          {Array.from({ length: maxRows }).map((_, idx) => (
            <React.Fragment key={idx}>
              {/* Right column (first) */}
              <div>
                {rightTanks[idx] && renderTankBlock(rightTanks[idx])}
              </div>
              {/* Left column (second) */}
              <div>
                {leftTanks[idx] && renderTankBlock(leftTanks[idx])}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="flex w-full justify-end mt-8">
          <Button 
            type="primary" 
            htmlType="submit" 
            className="h-8 w-48 font-bold bg-black text-white border-black" 
            disabled={disabled || submitting}
            loading={submitting}
          >
            {t('apply')}
          </Button>
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