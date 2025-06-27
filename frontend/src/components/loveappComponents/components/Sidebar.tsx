
import React from 'react';
import { Activity } from 'lucide-react';

interface SidebarProps {
  selectedLine: string;
  onLineSelect: (line: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedLine, onLineSelect }) => {
  const lines = ['01', '02', '03', '04'];

  return (
    <div className="bg-slate-800 text-white w-32 min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <span className="text-xs font-semibold">SYSTEM</span>
        </div>
        <h2 className="text-lg font-bold">CHỌN LINE</h2>
      </div>
      
      <div className="flex-1 p-2">
        {lines.map((line) => (
          <button
            key={line}
            onClick={() => onLineSelect(line)}
            className={`w-full mb-2 p-3 rounded-lg transition-colors ${
              selectedLine === line
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
          >
            <div className="text-xs text-gray-400">LINE</div>
            <div className="text-xl font-bold">{line}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
