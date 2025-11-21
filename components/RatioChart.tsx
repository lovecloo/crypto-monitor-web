'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface RatioChartProps {
  longShort: Array<{ time: string; value: number }>;
  topAccount: Array<{ time: string; value: number }>;
  topPosition: Array<{ time: string; value: number }>;
  timeRange: number;
  customDateRange: {start: Date | null, end: Date | null};
  coinSymbol: string;
}

export default function RatioChart({ longShort, topAccount, topPosition, timeRange, customDateRange, coinSymbol }: RatioChartProps) {
  const filteredData = useMemo(() => {
    // 优先使用自定义日期范围
    if (customDateRange.start || customDateRange.end) {
      const startTime = customDateRange.start ? customDateRange.start.getTime() : 0;
      const endTime = customDateRange.end ? customDateRange.end.getTime() : Date.now();
      return {
        longShort: longShort?.filter(d => {
          const time = new Date(d.time).getTime();
          return time >= startTime && time <= endTime;
        }) || [],
        topAccount: topAccount?.filter(d => {
          const time = new Date(d.time).getTime();
          return time >= startTime && time <= endTime;
        }) || [],
        topPosition: topPosition?.filter(d => {
          const time = new Date(d.time).getTime();
          return time >= startTime && time <= endTime;
        }) || []
      };
    }
    
    // 否则使用快速时间范围
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    return {
      longShort: longShort?.filter(d => new Date(d.time).getTime() >= cutoffTime) || [],
      topAccount: topAccount?.filter(d => new Date(d.time).getTime() >= cutoffTime) || [],
      topPosition: topPosition?.filter(d => new Date(d.time).getTime() >= cutoffTime) || []
    };
  }, [longShort, topAccount, topPosition, timeRange, customDateRange]);

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

  // 计算动态Y轴范围
  const yAxisRange = useMemo(() => {
    const allValues = [
      ...filteredData.longShort.map(d => d.value),
      ...filteredData.topAccount.map(d => d.value),
      ...filteredData.topPosition.map(d => d.value)
    ];
    if (allValues.length === 0) return { min: 0, max: 2 };
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal;
    // 留出10%的上下空间
    return {
      min: minVal - range * 0.1,
      max: maxVal + range * 0.1
    };
  }, [filteredData]);

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
      data: ['全网多空比', '大户账户多空比', '大户持仓多空比'],
      icon: 'circle',
      itemWidth: 12,
      itemHeight: 12
    },
    xAxis: {
      type: 'category',
      data: filteredData.longShort.map(d => d.time),
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
    yAxis: { 
      type: 'value',
      min: yAxisRange.min,
      max: yAxisRange.max
    },
    series: [
      {
        name: '全网多空比',
        type: 'line',
        smooth: true,
        data: filteredData.longShort.map(d => d.value),
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },  // 图例圆圈颜色
        showSymbol: false  // 隐藏数据点圆圈
      },
      {
        name: '大户账户多空比',
        type: 'line',
        smooth: true,
        data: filteredData.topAccount.map(d => d.value),
        lineStyle: { color: '#f59e0b', width: 2 },
        itemStyle: { color: '#f59e0b' },  // 图例圆圈颜色
        showSymbol: false  // 隐藏数据点圆圈
      },
      {
        name: '大户持仓多空比',
        type: 'line',
        smooth: true,
        data: filteredData.topPosition.map(d => d.value),
        lineStyle: { color: '#ef4444', width: 2 },
        itemStyle: { color: '#ef4444' },  // 图例圆圈颜色
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

  // 检查是否有数据
  if (filteredData.longShort.length === 0 && filteredData.topAccount.length === 0 && filteredData.topPosition.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">{coinSymbol} - 多空比对比</h3>
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

