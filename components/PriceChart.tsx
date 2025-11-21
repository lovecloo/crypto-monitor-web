'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface PriceChartProps {
  data: Array<{ time: string; value: number }>;
  openInterestData: Array<{ time: string; value: number }>;
  timeRange: number;
  customDateRange: {start: Date | null, end: Date | null};
  coinSymbol: string;
}

export default function PriceChart({ data, openInterestData, timeRange, customDateRange, coinSymbol }: PriceChartProps) {
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    // 优先使用自定义日期范围
    if (customDateRange.start || customDateRange.end) {
      const startTime = customDateRange.start ? customDateRange.start.getTime() : 0;
      const endTime = customDateRange.end ? customDateRange.end.getTime() : Date.now();
      return data.filter(d => {
        const time = new Date(d.time).getTime();
        return time >= startTime && time <= endTime;
      });
    }
    
    // 否则使用快速时间范围
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return data.filter(d => new Date(d.time).getTime() >= cutoffTime);
  }, [data, timeRange, customDateRange]);

  const filteredOIData = useMemo(() => {
    if (!openInterestData) return [];
    
    // 优先使用自定义日期范围
    if (customDateRange.start || customDateRange.end) {
      const startTime = customDateRange.start ? customDateRange.start.getTime() : 0;
      const endTime = customDateRange.end ? customDateRange.end.getTime() : Date.now();
      return openInterestData.filter(d => {
        const time = new Date(d.time).getTime();
        return time >= startTime && time <= endTime;
      });
    }
    
    // 否则使用快速时间范围
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return openInterestData.filter(d => new Date(d.time).getTime() >= cutoffTime);
  }, [openInterestData, timeRange, customDateRange]);

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

  // 计算价格的动态Y轴范围
  const priceRange = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { min: 0, max: 1 };
    const prices = filteredData.map(d => d.value);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    // 留出10%的上下空间
    return {
      min: minPrice - range * 0.1,
      max: maxPrice + range * 0.1
    };
  }, [filteredData]);

  // 计算持仓量的动态Y轴范围
  const oiRange = useMemo(() => {
    if (!filteredOIData || filteredOIData.length === 0) return { min: 0, max: 1 };
    const ois = filteredOIData.map(d => d.value);
    const minOI = Math.min(...ois);
    const maxOI = Math.max(...ois);
    const range = maxOI - minOI;
    // 留出10%的上下空间
    return {
      min: minOI - range * 0.1,
      max: maxOI + range * 0.1
    };
  }, [filteredOIData]);

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
      data: ['价格', '持仓量'],
      top: 50,
      left: 'center',
      itemGap: 30,
      icon: 'circle',
      itemWidth: 12,
      itemHeight: 12
    },
    xAxis: {
      type: 'category',
      data: filteredData.map(d => d.time),
      axisLabel: {
        formatter: (value: string) => {
          const date = new Date(value);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          return `${hours}:${String(minutes).padStart(2, '0')}`;
        },
        rotate: 0,
        fontSize: 11,
        interval: 'auto',  // 自动计算间隔，避免重叠
        showMinLabel: true,
        showMaxLabel: true
      },
      axisTick: {
        alignWithLabel: true
      },
      boundaryGap: false
    },
    yAxis: [
      {
        type: 'value',
        position: 'left',
        min: priceRange.min,
        max: priceRange.max,
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
        min: oiRange.min,
        max: oiRange.max,
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
        itemStyle: { color: '#10b981' },  // 图例圆圈颜色
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
        itemStyle: { color: '#f59e0b' },  // 图例圆圈颜色
        showSymbol: false  // 隐藏数据点圆圈
      }
    ],
    grid: { left: '10%', right: '12%', bottom: '15%', top: '30%' }
  };

  // 检查是否有数据
  if (filteredData.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">{coinSymbol} - 价格与持仓量走势</h3>
        <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-lg mb-2">📭 该时间段暂无数据</p>
            <p className="text-sm">请选择其他日期范围或使用快速时间选择</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 日期范围提示 */}
      {(customDateRange.start || customDateRange.end) && (
        <div className="text-xs text-blue-600 mb-2">
          📅 自定义日期范围: {customDateRange.start?.toLocaleDateString('zh-CN') || '开始'} - {customDateRange.end?.toLocaleDateString('zh-CN') || '现在'}
        </div>
      )}
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

