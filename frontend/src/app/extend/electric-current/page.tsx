
"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/loveappComponents/components/Sidebar';
import ProcessCard from '@/components/loveappComponents/components/ProcessCard';
import AlertBanner from '@/components/loveappComponents/components/AlertBanner';
import StatusIndicator from '@/components/loveappComponents/components/StatusIndicator';
import { Thermometer, Zap } from 'lucide-react';

const Index = () => {
  const [selectedLine, setSelectedLine] = useState('01');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    setMounted(true);
  }, []);


  // Mock data for different lines
  const getProcessData = (line: string) => {
    const baseData = {
      '01': {
        temperature: [
          { title: 'Washing', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Boiling degreasing', value: 39.6, target: 50, status: 'low' as const },
          { title: 'Electro degreasing 1', value: 52.6, target: 50, status: 'high' as const },
          { title: 'Electro degreasing 2', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Pre-nickel plating', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Nickel plating 1', value: 39.6, target: 50, status: 'low' as const },
          { title: 'Nickel plating 2', value: 52.6, target: 50, status: 'high' as const },
          { title: 'Nickel plating 3', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Ultrasonic hot rinse', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Hot Rinse', value: 39.6, target: 50, status: 'low' as const },
          { title: 'Dryer 1', value: 52.6, target: 50, status: 'high' as const },
          { title: 'Dryer 2', value: 49.6, target: 50, status: 'normal' as const },
        ],
        electrical: [
          { title: 'Electro degreasing 1', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Electro degreasing 2', value: 39.6, target: 50, status: 'low' as const },
          { title: 'Pre-nickel plating', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Nickel plating 1', value: 39.6, target: 50, status: 'low' as const },
          { title: 'Nickel plating 2', value: 49.6, target: 50, status: 'normal' as const },
          { title: 'Nickel plating 3', value: 49.6, target: 50, status: 'normal' as const },
        ]
      }
    };

    return baseData[line as keyof typeof baseData] || baseData['01'];
  };

  const processData = getProcessData(selectedLine);
  
  // Generate alerts based on out-of-range values
  const alerts = [
    { type: 'Dòng điện', value: 39.6, message: 'Boiling Degreasing' },
    { type: 'Nhiệt độ', value: 39.6, message: 'Boiling Degreasing' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar selectedLine={selectedLine} onLineSelect={setSelectedLine} />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Thông Số LINE {selectedLine}
            </h1>
            <div className="text-sm text-gray-600">
                {mounted ? `Cập nhật: ${currentTime.toLocaleTimeString('vi-VN')}` : "Cập nhật: --:--:--"}
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-6">
            <AlertBanner alerts={alerts} />
          </div>
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
                  status={process.status}
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
                    status={process.status}
                    type="electrical"
                  />
                ))}
              </div>
            </div>

            {/* Status Indicators - Below the yellow box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusIndicator 
                type="machine_maintenance" 
                time="23:59:30" 
              />
              <StatusIndicator 
                type="pump_maintenance" 
                time="23:59:30" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
