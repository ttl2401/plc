
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  type: 'machine_maintenance' | 'pump_maintenance';
  time: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ type, time }) => {
  const getStatusInfo = () => {
    switch (type) {
      case 'machine_maintenance':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Vệ sinh máy lọc',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          iconBg: 'bg-red-500'
        };
      case 'pump_maintenance':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Vệ sinh máy bơm',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          iconBg: 'bg-red-500'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Status',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          iconBg: 'bg-gray-500'
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className={`${status.bgColor} border border-red-200 rounded-lg p-3 flex items-center gap-2`}>
      <div className={`${status.iconBg} p-1 rounded`}>
        <div className="text-white">
          {status.icon}
        </div>
      </div>
      <div>
        <div className={`text-sm font-medium ${status.textColor}`}>
          {status.text}
        </div>
        <div className={`text-sm ${status.textColor}`}>
          {time}
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
