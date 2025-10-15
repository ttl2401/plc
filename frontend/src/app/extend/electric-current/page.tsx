
"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/extend-information/Sidebar';
import ProcessCard from '@/components/extend-information/ProcessCard';
import AlertBanner from '@/components/extend-information/AlertBanner';
import StatusIndicator from '@/components/extend-information/StatusIndicator';
import { Thermometer, Zap } from 'lucide-react';
import { fetchPLCTemperatureVariables, fetchPLCElectricityVariables, PLCVariable } from '@/services/parameterMonitorService';
import { useLanguage } from './LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  const [selectedLine, setSelectedLine] = useState('01');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [processData, setProcessData] = useState<{ temperature: { title: string; value?: number; target: number }[]; electrical: { title: string; value?: number; target: number }[] }>({ temperature: [], electrical: [] });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    setMounted(true);
  }, []);


  const titleMap: Record<string, string> = {
    Washing: 'Washing',
    Boiling_Degreasing: 'Boiling degreasing',
    Electro_Degreasing_1: 'Electro degreasing 1',
    Electro_Degreasing_2: 'Electro degreasing 2',
    Pre_Nickel_Plating: 'Pre-nickel plating',
    Nickel_Plating_1: 'Nickel plating 1',
    Nickel_Plating_2: 'Nickel plating 2',
    Nickel_Plating_3: 'Nickel plating 3',
    Ultrasonic_Hot_Rinse: 'Ultrasonic hot rinse',
    Hot_Rinse: 'Hot Rinse',
    Dryer_1: 'Dryer'
  };

  const temperatureOrder = [
    'Washing',
    'Boiling_Degreasing',
    'Electro_Degreasing_1',
    'Electro_Degreasing_2',
    'Pre_Nickel_Plating',
    'Nickel_Plating_1',
    'Nickel_Plating_2',
    'Ultrasonic_Hot_Rinse',
    'Hot_Rinse',
    'Dryer_1'
  ];

  const electricityOrder = [
    'Electro_Degreasing_1',
    'Electro_Degreasing_2',
    'Pre_Nickel_Plating',
    'Nickel_Plating_1',
    'Nickel_Plating_2'
  ];

  const toNumber = (v: unknown): number | undefined =>
    typeof v === 'number' && !Number.isNaN(v) ? v : undefined;

  const mapTemperatureVariables = (vars: PLCVariable[]) => {
    const measured = new Map<string, number | undefined>();
    const setting = new Map<string, number | undefined>();

    vars.forEach((it) => {
      if (it.name.startsWith('Nhiet_do_cai_')) {
        const key = it.name.replace('Nhiet_do_cai_', '');
        setting.set(key, toNumber(it.value));
      } else if (it.name.startsWith('Nhiet_do_')) {
        const key = it.name.replace('Nhiet_do_', '');
        measured.set(key, toNumber(it.value));
      }
    });

    const items: { title: string; value?: number; target: number }[] = [];
    temperatureOrder.forEach((key) => {
      if (measured.has(key)) {
        const title = titleMap[key] || key.replace(/_/g, ' ');
        const value = measured.get(key);
        const target = setting.get(key);
        items.push({ title, value, target: typeof target === 'number' ? target : 0 });
      }
    });
    return items;
  };

  const mapElectricityVariables = (vars: PLCVariable[]) => {
    const measured = new Map<string, number | undefined>();
    const setting = new Map<string, number | undefined>();

    vars.forEach((it) => {
      if (it.name.startsWith('Cai_chinh_luu_')) {
        const key = it.name.replace('Cai_chinh_luu_', '');
        setting.set(key, toNumber(it.value));
      } else if (it.name.startsWith('Vi_tri_')) {
        const key = it.name.replace('Vi_tri_', '');
        measured.set(key, toNumber(it.value));
      }
    });

    const items: { title: string; value?: number; target: number }[] = [];
    electricityOrder.forEach((key) => {
      if (measured.has(key)) {
        const title = titleMap[key] || key.replace(/_/g, ' ');
        const value = measured.get(key);
        const target = setting.get(key);
        items.push({ title, value, target: typeof target === 'number' ? target : 0 });
      }
    });
    return items;
  };

  const getProcessData = async (line: string) => {
    try {
      const [tempRes, elecRes] = await Promise.all([
        fetchPLCTemperatureVariables(),
        fetchPLCElectricityVariables()
      ]);

      const temperature = tempRes?.data ? mapTemperatureVariables(tempRes.data) : [];
      const electrical = elecRes?.data ? mapElectricityVariables(elecRes.data) : [];
      setProcessData({ temperature, electrical });
    } catch (e) {
      setProcessData({ temperature: [], electrical: [] });
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchAndSet = async () => {
      if (!cancelled) {
        await getProcessData(selectedLine);
      }
    };
    // initial fetch
    fetchAndSet();
    // poll every 2s
    const intervalId = setInterval(fetchAndSet, 2000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLine]);
  
  // Generate alerts: pick the highest absolute deviation per type
  const computeAlerts = () => {
    const alerts: Array<{ type: string; value: number; message: string; level: 'high' | 'low' }> = [];

    const buildAlertFor = (
      items: { title: string; value?: number; target: number }[],
      typeLabel: string
    ) => {
      let maxAbsDiff = -1;
      let alertTitle = '';
      let alertValue: number | null = null;
      let alertLevel: 'high' | 'low' | null = null;

      items.forEach((it) => {
        if (typeof it.value === 'number' && typeof it.target === 'number') {
          const diff = it.value - it.target;
          const level: 'high' | 'low' | null = diff > 2 ? 'high' : diff < -2 ? 'low' : null;
          if (level) {
            const diffAbs = Math.abs(diff);
            if (diffAbs > maxAbsDiff) {
              maxAbsDiff = diffAbs;
              alertTitle = it.title;
              alertValue = it.value;
              alertLevel = level;
            }
          }
        }
      });

      if (alertLevel && alertValue !== null) {
        alerts.push({ type: typeLabel, value: alertValue, message: alertTitle, level: alertLevel });
      }
    };

    buildAlertFor(processData.electrical, 'Dòng điện');
    buildAlertFor(processData.temperature, 'Nhiệt độ');

    return alerts;
  };
  const alerts = computeAlerts();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar selectedLine={selectedLine} onLineSelect={setSelectedLine} />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t('electric_temperature_info_title')}
            </h1>
            <div className="text-sm text-gray-600">
                {mounted ? `Cập nhật: ${currentTime.toLocaleTimeString('vi-VN')}` : "Cập nhật: --:--:--"}
            </div>
          </div>
          
          {/* TEMPORARILY HIDDEN - Alert Banner (Dòng điện quá thấp, Nhiệt độ quá thấp) - can be restored later */}
          {/* <div className="flex-shrink-0 ml-6">
            <AlertBanner alerts={alerts} />
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Temperature Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-red-200 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Thermometer className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-800">NHIỆT ĐỘ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {processData.temperature.map((process, index) => (
                <ProcessCard
                  key={`temp-${index}`}
                  title={process.title}
                  value={process.value}
                  target={process.target}
                  unit="°C"
                  type="temperature"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Electrical Section - Half height */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-200">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-800">DÒNG ĐIỆN</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processData.electrical.map((process, index) => (
                  <ProcessCard
                    key={`elec-${index}`}
                    title={process.title}
                    value={process.value}
                    target={process.target}
                    unit="A"
                    type="electrical"
                  />
                ))}
              </div>
            </div>

            {/* TEMPORARILY HIDDEN - Status Indicators (Vệ sinh máy lọc, Vệ sinh máy bơm) - can be restored later */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusIndicator 
                type="machine_maintenance" 
                time="23:59:30" 
              />
              <StatusIndicator 
                type="pump_maintenance" 
                time="23:59:30" 
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
