'use client';

interface TimeRangeSelectorProps {
  value: number;
  onChange: (hours: number) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const ranges = [
    { label: '1小时', value: 1, icon: '🕐' },
    { label: '6小时', value: 6, icon: '🕕' },
    { label: '24小时', value: 24, icon: '📆' },
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
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105'
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

