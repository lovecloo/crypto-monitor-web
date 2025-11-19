'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface RatioChartProps {
  longShort: Array<{ time: string; value: number }>;
  topAccount: Array<{ time: string; value: number }>;
  topPosition: Array<{ time: string; value: number }>;
  timeRange: number;
  coinSymbol: string;
}

export default function RatioChart({ longShort, topAccount, topPosition, timeRange, coinSymbol }: RatioChartProps) {
  const filteredData = useMemo(() => {
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return {
      longShort: longShort?.filter(d => new Date(d.time).getTime() >= cutoffTime) || [],
      topAccount: topAccount?.filter(d => new Date(d.time).getTime() >= cutoffTime) || [],
      topPosition: topPosition?.filter(d => new Date(d.time).getTime() >= cutoffTime) || []
    };
  }, [longShort, topAccount, topPosition, timeRange]);

  // 计算各指标的变化
  const calculateChange = (data: Array<{ time: string; value: number }>) => {
    if (!data || data.length < 2) return { value: 0, percent: 0 };
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const change = last - first;
    const percent = (change / first) * 100;
    return { value: change, percent, current: last };
  };

  const changes = {
    longShort: calculateChange(filteredData.longShort),
    topAccount: calculateChange(filteredData.topAccount),
    topPosition: calculateChange(filteredData.topPosition)
  };

  const option = {
    title: { 
      text: `${coinSymbol} - 多空比对比`,
      left: 20,
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: {
      type: 'category',
      data: filteredData.longShort.map(d => d.time),
      axisLabel: {
        formatter: (value: string) => {
          const date = new Date(value);
          return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
      }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '全网多空比',
        type: 'line',
        data: filteredData.longShort.map(d => d.value),
        lineStyle: { color: '#10b981' }
      },
      {
        name: '大户账户多空比',
        type: 'line',
        data: filteredData.topAccount.map(d => d.value),
        lineStyle: { color: '#f59e0b' }
      },
      {
        name: '大户持仓多空比',
        type: 'line',
        data: filteredData.topPosition.map(d => d.value),
        lineStyle: { color: '#ef4444' }
      }
    ],
    grid: { left: '10%', right: '5%', bottom: '15%', top: '25%' }
  };

  const RatioCard = ({ title, change, color }: { title: string, change: any, color: string }) => (
    <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-800">{change.current?.toFixed(2) || '0.00'}</span>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-semibold ${change.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change.percent >= 0 ? '▲' : '▼'}
          </span>
          <span className={`text-sm font-bold ${change.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change.percent >= 0 ? '+' : ''}{change.percent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* 指标卡片 */}
      <div className="flex gap-3 mb-4">
        <RatioCard title="全网多空比" change={changes.longShort} color="green" />
        <RatioCard title="大户账户比" change={changes.topAccount} color="orange" />
        <RatioCard title="大户持仓比" change={changes.topPosition} color="red" />
      </div>
      <ReactECharts option={option} style={{ height: '300px' }} />
    </div>
  );
}

