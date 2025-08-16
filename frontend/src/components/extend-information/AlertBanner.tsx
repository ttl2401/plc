
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  alerts: Array<{
    type: string;
    value: number;
    message: string; // tank name
    level: 'high' | 'low';
  }>;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="flex gap-4">
      {alerts.map((alert, index) => (
        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 min-w-[280px]">
          <div className="bg-red-500 p-1 rounded">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-red-800">
              <b>{alert.type}</b> bồn <span className="font-bold">{alert.message}</span>
            </div>
            <div className="text-sm text-red-600">
              là <span className="font-bold">{alert.value}</span> đang quá {alert.level === 'high' ? 'cao' : 'thấp'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
