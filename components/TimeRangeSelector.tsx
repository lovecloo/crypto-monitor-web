'use client';

interface TimeRangeSelectorProps {
  value: number;
  onChange: (hours: number) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const ranges = [
    { label: '1小时', value: 1 },
    { label: '6小时', value: 6 },
    { label: '24小时', value: 24 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">📅 时间范围</h3>
      <div className="space-y-2">
        {ranges.map(range => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              value === range.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

