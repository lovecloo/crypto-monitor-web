'use client';

import { useState, useEffect } from 'react';
import CoinSelector from '@/components/CoinSelector';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import DateRangeSelector from '@/components/DateRangeSelector';
import PriceChart from '@/components/PriceChart';
import RatioChart from '@/components/RatioChart';
import DataTable from '@/components/DataTable';

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState('TAG');
  const [timeRange, setTimeRange] = useState(24); // 小时
  const [customDateRange, setCustomDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // GitHub Raw URL - 从data分支读取数据
  const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/lovecloo/crypto-monitor-web/data/public';

  useEffect(() => {
    // 加载数据的函数
    const loadData = () => {
      // 使用实时时间戳破解CDN缓存
      const timestamp = Date.now();
      fetch(`${GITHUB_RAW_BASE}/data.json?t=${timestamp}&_=${Math.random()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
        .then(res => res.json())
        .then(jsonData => {
          setData(jsonData);
          setLoading(false);
        })
        .catch(err => {
          console.error('加载数据失败:', err);
          setLoading(false);
        });
    };

    // 初始加载
    loadData();

    // 每30秒刷新一次数据（更频繁）
    const interval = setInterval(() => {
      loadData();
    }, 30000);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 标题栏 */}
      <header className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📊 加密货币监控仪表盘
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                实时更新 • 最后更新: {data.last_updated}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧控制面板 */}
          <div className="col-span-3 space-y-5">
            {/* 币种选择器 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-lg">🪙</span>
                选择币种
              </h3>
              <CoinSelector
                coins={data.symbols}
                selected={selectedCoin}
                onChange={setSelectedCoin}
              />
            </div>

            {/* 时间范围选择器 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-lg">⏰</span>
                快速时间选择
              </h3>
              <TimeRangeSelector
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>

            {/* 日期范围选择器 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-lg">📅</span>
                自定义日期范围
              </h3>
              <DateRangeSelector
                startDate={customDateRange.start}
                endDate={customDateRange.end}
                onChange={setCustomDateRange}
              />
            </div>
          </div>

          {/* 右侧主内容 */}
          <div className="col-span-9 space-y-6">
                    {/* 价格图表 */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                      <PriceChart 
                        data={coinData.price} 
                        openInterestData={coinData.open_interest_aggregated}
                        timeRange={timeRange} 
                        coinSymbol={selectedCoin}
                      />
                    </div>

            {/* 多空比图表 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <RatioChart 
                longShort={coinData.long_short_ratio}
                topAccount={coinData.top_account_ratio}
                topPosition={coinData.top_position_ratio}
                timeRange={timeRange}
                coinSymbol={selectedCoin}
              />
            </div>

            {/* 数据表格 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <DataTable 
                data={coinData} 
                timeRange={timeRange}
                coinSymbol={selectedCoin}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
