import React from 'react';
import { Thermometer, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProcessCardProps {
  title: string;
  value?: number;
  target: number;
  unit: string;
  status?: 'normal' | 'low' | 'high';
  type: 'temperature' | 'electrical';
}

const ProcessCard: React.FC<ProcessCardProps> = ({ 
  title, 
  value: propValue, 
  target, 
  unit, 
  status: propStatus, 
  type 
}) => {
  const [value, setValue] = useState<number>(
    typeof propValue === 'number' ? propValue : randomValue()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(randomValue());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  function randomValue() {
    return Math.round((Math.random() * (55 - 38) + 38) * 10) / 10;
  }

  let status: 'normal' | 'low' | 'high' = 'normal';
  if (value > 51) status = 'high';
  else if (value < 47) status = 'low';

  const getStatusColor = () => {
    switch (status) {
      case 'high': return 'text-red-500';
      case 'low': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'high': return 'Cao';
      case 'low': return 'Thấp';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-md border">
      <div className="bg-slate-700 text-white px-3 py-2 rounded-md text-sm font-medium mb-3 text-center">
        {title}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {value}
          </div>
          {status !== 'normal' && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-red-500 text-xs font-medium">
                {getStatusText()}
              </span>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <div className="bg-gray-100 px-3 py-2 rounded border text-sm">
            <div className="text-xs text-gray-500 mb-1 text-center">Cài đặt</div>
            <div className="font-bold text-green-600 text-center">{target}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessCard;
