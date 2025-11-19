'use client';

import { useState } from 'react';

interface DateRangeSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: {start: Date | null, end: Date | null}) => void;
}

export default function DateRangeSelector({ startDate, endDate, onChange }: DateRangeSelectorProps) {
  const [localStart, setLocalStart] = useState('');
  const [localEnd, setLocalEnd] = useState('');

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalStart(e.target.value);
    const date = e.target.value ? new Date(e.target.value) : null;
    onChange({ start: date, end: endDate });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEnd(e.target.value);
    const date = e.target.value ? new Date(e.target.value) : null;
    onChange({ start: startDate, end: date });
  };

  const handleClear = () => {
    setLocalStart('');
    setLocalEnd('');
    onChange({ start: null, end: null });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">
          开始日期
        </label>
        <input
          type="date"
          value={localStart}
          onChange={handleStartChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">
          结束日期
        </label>
        <input
          type="date"
          value={localEnd}
          onChange={handleEndChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {(localStart || localEnd) && (
        <button
          onClick={handleClear}
          className="w-full px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          清除选择
        </button>
      )}

      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 提示：自定义日期范围将覆盖快速时间选择
        </p>
      </div>
    </div>
  );
}

