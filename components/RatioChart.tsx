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
    legend: { 
      bottom: 0,
      data: [
        { name: '全网多空比', icon: 'path://M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
        { name: '大户账户多空比', icon: 'path://M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
        { name: '大户持仓多空比', icon: 'path://M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z' }
      ],
      itemWidth: 18,
      itemHeight: 18
    },
    xAxis: {
      type: 'category',
      data: filteredData.longShort.map(d => d.time),
      axisLabel: {
        formatter: (value: string) => {
          const date = new Date(value);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          // 每隔5分钟显示：0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
          if (minutes % 5 === 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}`;
          }
          return '';
        },
        rotate: 45,  // 倾斜45度，避免重叠
        fontSize: 10,
        interval: 0  // 显示所有标签（由formatter控制显示哪些）
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '全网多空比',
        type: 'line',
        smooth: true,
        data: filteredData.longShort.map(d => d.value),
        lineStyle: { color: '#10b981', width: 2 },
        showSymbol: false  // 隐藏数据点圆圈
      },
      {
        name: '大户账户多空比',
        type: 'line',
        smooth: true,
        data: filteredData.topAccount.map(d => d.value),
        lineStyle: { color: '#f59e0b', width: 2 },
        showSymbol: false  // 隐藏数据点圆圈
      },
      {
        name: '大户持仓多空比',
        type: 'line',
        smooth: true,
        data: filteredData.topPosition.map(d => d.value),
        lineStyle: { color: '#ef4444', width: 2 },
        showSymbol: false  // 隐藏数据点圆圈
      }
    ],
    grid: { left: '10%', right: '5%', bottom: '15%', top: '25%' }
  };

  const RatioCard = ({ title, change, color }: { title: string, change: any, color: string }) => (
    <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <div className="flex items-center justify-between">
        <span className={`text-lg font-bold ${change.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change.current?.toFixed(2) || '0.00'}
        </span>
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
        <RatioCard title="大户账户多空比" change={changes.topAccount} color="orange" />
        <RatioCard title="大户持仓多空比" change={changes.topPosition} color="red" />
      </div>
      <ReactECharts option={option} style={{ height: '300px' }} />
    </div>
  );
}

