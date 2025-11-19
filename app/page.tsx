'use client';

import { useState, useEffect } from 'react';
import CoinSelector from '@/components/CoinSelector';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import PriceChart from '@/components/PriceChart';
import RatioChart from '@/components/RatioChart';
import DataTable from '@/components/DataTable';

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState('TAG');
  const [timeRange, setTimeRange] = useState(24); // 小时
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载数据
    fetch('/data.json')
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('加载数据失败:', err);
        setLoading(false);
      });

    // 每1分钟刷新一次数据
    const interval = setInterval(() => {
      fetch('/data.json?' + Date.now()) // 防止缓存
        .then(res => res.json())
        .then(jsonData => setData(jsonData));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">数据加载失败</div>
      </div>
    );
  }

  const coinData = data.data[selectedCoin] || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 标题栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🪙 加密货币监控仪表盘
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            最后更新: {data.last_updated}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧控制面板 */}
          <div className="col-span-3 space-y-4">
            <CoinSelector
              coins={data.symbols}
              selected={selectedCoin}
              onChange={setSelectedCoin}
            />
            <TimeRangeSelector
              value={timeRange}
              onChange={setTimeRange}
            />
          </div>

          {/* 右侧主内容 */}
          <div className="col-span-9 space-y-4">
            {/* 价格图表 */}
            <div className="bg-white rounded-lg shadow p-6">
              <PriceChart data={coinData.price} timeRange={timeRange} />
            </div>

            {/* 多空比图表 */}
            <div className="bg-white rounded-lg shadow p-6">
              <RatioChart 
                longShort={coinData.long_short_ratio}
                topAccount={coinData.top_account_ratio}
                topPosition={coinData.top_position_ratio}
                timeRange={timeRange}
              />
            </div>

            {/* 数据表格 */}
            <div className="bg-white rounded-lg shadow p-6">
              <DataTable data={coinData} timeRange={timeRange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
