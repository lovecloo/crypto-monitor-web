'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface PriceChartProps {
  data: Array<{ time: string; value: number }>;
  timeRange: number;
  coinSymbol: string;
}

export default function PriceChart({ data, timeRange, coinSymbol }: PriceChartProps) {
  const filteredData = useMemo(() => {
    if (!data) return [];
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return data.filter(d => new Date(d.time).getTime() >= cutoffTime);
  }, [data, timeRange]);

  // 计算价格变化
  const priceChange = useMemo(() => {
    if (!filteredData || filteredData.length < 2) return { value: 0, percent: 0 };
    const first = filteredData[0].value;
    const last = filteredData[filteredData.length - 1].value;
    const change = last - first;
    const percent = (change / first) * 100;
    return { value: change, percent };
  }, [filteredData]);

  const latestPrice = filteredData.length > 0 ? filteredData[filteredData.length - 1].value : 0;

  const option = {
    title: { 
      text: `${coinSymbol} - 价格走势`,
      left: 20,
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
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
    grid: { left: '10%', right: '5%', bottom: '15%', top: '20%' }
  };

  return (
    <div>
      {/* 价格信息栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-gray-800">
            ${latestPrice.toFixed(latestPrice < 1 ? 8 : latestPrice < 10 ? 5 : 2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold ${priceChange.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange.percent >= 0 ? '▲' : '▼'}
          </span>
          <span className={`text-lg font-bold ${priceChange.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
          </span>
          <span className={`text-sm ${priceChange.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ({priceChange.percent >= 0 ? '+' : ''}${priceChange.value.toFixed(8)})
          </span>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '300px' }} />
    </div>
  );
}

