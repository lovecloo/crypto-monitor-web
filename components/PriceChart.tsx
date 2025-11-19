'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface PriceChartProps {
  data: Array<{ time: string; value: number }>;
  timeRange: number;
}

export default function PriceChart({ data, timeRange }: PriceChartProps) {
  const filteredData = useMemo(() => {
    if (!data) return [];
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return data.filter(d => new Date(d.time).getTime() >= cutoffTime);
  }, [data, timeRange]);

  const option = {
    title: { text: '💰 价格走势', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        return `${point.name}<br/>价格: $${point.value.toFixed(8)}`;
      }
    },
    xAxis: {
      type: 'category',
      data: filteredData.map(d => d.time),
      axisLabel: {
        formatter: (value: string) => {
          const date = new Date(value);
          return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `$${value.toFixed(6)}`
      }
    },
    series: [{
      name: '价格',
      type: 'line',
      smooth: true,
      data: filteredData.map(d => d.value),
      lineStyle: { color: '#3b82f6', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ]
        }
      }
    }],
    grid: { left: '10%', right: '5%', bottom: '15%', top: '15%' }
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}

