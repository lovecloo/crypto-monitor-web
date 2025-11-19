'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface RatioChartProps {
  longShort: Array<{ time: string; value: number }>;
  topAccount: Array<{ time: string; value: number }>;
  topPosition: Array<{ time: string; value: number }>;
  timeRange: number;
}

export default function RatioChart({ longShort, topAccount, topPosition, timeRange }: RatioChartProps) {
  const filteredData = useMemo(() => {
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return {
      longShort: longShort?.filter(d => new Date(d.time).getTime() >= cutoffTime) || [],
      topAccount: topAccount?.filter(d => new Date(d.time).getTime() >= cutoffTime) || [],
      topPosition: topPosition?.filter(d => new Date(d.time).getTime() >= cutoffTime) || []
    };
  }, [longShort, topAccount, topPosition, timeRange]);

  const option = {
    title: { text: '⚖️ 多空比对比', left: 'center' },
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
    grid: { left: '10%', right: '5%', bottom: '15%', top: '15%' }
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}

