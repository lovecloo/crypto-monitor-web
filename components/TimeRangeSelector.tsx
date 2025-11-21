'use client';

interface TimeRangeSelectorProps {
  value: number;
  onChange: (hours: number) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const ranges = [
    { 
      label: '1小时', 
      value: 1, 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
    },
    { 
      label: '6小时', 
      value: 6, 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
    },
    { 
      label: '24小时', 
      value: 24, 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {ranges.map(range => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`
            px-3 py-2 rounded-lg text-xs font-medium
            transition-all duration-200 transform
            ${value === range.value
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md scale-105'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-102'
            }
          `}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-base">{range.icon}</span>
            <span>{range.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

