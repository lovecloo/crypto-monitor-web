'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface PriceChartProps {
  data: Array<{ time: string; value: number }>;
  openInterestData: Array<{ time: string; value: number }>;
  timeRange: number;
  coinSymbol: string;
}

export default function PriceChart({ data, openInterestData, timeRange, coinSymbol }: PriceChartProps) {
  const filteredData = useMemo(() => {
    if (!data) return [];
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return data.filter(d => new Date(d.time).getTime() >= cutoffTime);
  }, [data, timeRange]);

  const filteredOIData = useMemo(() => {
    if (!openInterestData) return [];
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return openInterestData.filter(d => new Date(d.time).getTime() >= cutoffTime);
  }, [openInterestData, timeRange]);

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
      text: `${coinSymbol} - 价格与持仓量走势`,
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
        let result = params[0].name + '<br/>';
        params.forEach((item: any) => {
          if (item.seriesName === '价格') {
            result += `${item.marker}${item.seriesName}: $${item.value.toFixed(8)}<br/>`;
          } else if (item.seriesName === '持仓量') {
            const oi = item.value;
            const oiStr = oi >= 1000000 ? `$${(oi / 1000000).toFixed(2)}M` : `$${oi.toFixed(0)}`;
            result += `${item.marker}${item.seriesName}: ${oiStr}<br/>`;
          }
        });
        return result;
      }
    },
    legend: {
      data: [
        { name: '价格', icon: 'path://M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z' },
        { name: '持仓量', icon: 'path://M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' }
      ],
      top: 50,
      left: 'center',
      itemGap: 30,
      itemWidth: 20,
      itemHeight: 20
    },
    xAxis: {
      type: 'category',
      data: filteredData.map(d => d.time),
      axisLabel: {
        formatter: (value: string, index: number) => {
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
    yAxis: [
      {
        type: 'value',
        position: 'left',
        axisLabel: {
          formatter: (value: number) => `$${value.toFixed(6)}`
        },
        axisLine: {
          lineStyle: {
            color: '#10b981'
          }
        }
      },
      {
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) {
              return `$${(value / 1000000).toFixed(1)}M`;
            }
            return `$${(value / 1000).toFixed(0)}K`;
          }
        },
        axisLine: {
          lineStyle: {
            color: '#f59e0b'
          }
        }
      }
    ],
    series: [
      {
        name: '价格',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        data: filteredData.map(d => d.value),
        lineStyle: { color: '#10b981', width: 2 },
        showSymbol: false,  // 隐藏数据点圆圈
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        }
      },
      {
        name: '持仓量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: filteredOIData.map(d => d.value),
        lineStyle: { color: '#f59e0b', width: 2 },
        showSymbol: false  // 隐藏数据点圆圈
      }
    ],
    grid: { left: '10%', right: '12%', bottom: '15%', top: '30%' }
  };

  return (
    <div>
      {/* 价格信息栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={`text-2xl font-bold ${priceChange.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

