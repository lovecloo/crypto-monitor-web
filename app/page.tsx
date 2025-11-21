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

  useEffect(() => {
    // 加载数据的函数
    const loadData = () => {
      const timestamp = Date.now();
      
      // 使用 Vercel API 路由代理（避免 CORS 问题）
      fetch(`/api/data?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
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

    // 每30秒刷新一次数据
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                加密货币监控仪表盘
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
                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
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

