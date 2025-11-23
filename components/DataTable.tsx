'use client';

import { useMemo, useState } from 'react';

interface DataTableProps {
  data: any;
  timeRange: number;
  customDateRange: {start: Date | null, end: Date | null};
  coinSymbol: string;
}

export default function DataTable({ data, timeRange, customDateRange, coinSymbol }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableData = useMemo(() => {
    if (!data.price) return [];
    
    let filtered;
    // 优先使用自定义日期范围
    if (customDateRange.start || customDateRange.end) {
      const startTime = customDateRange.start ? customDateRange.start.getTime() : 0;
      const endTime = customDateRange.end ? customDateRange.end.getTime() : Date.now();
      filtered = data.price.filter((p: any) => {
        const time = new Date(p.time).getTime();
        return time >= startTime && time <= endTime;
      });
    } else {
      // 否则使用快速时间范围
      const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
      filtered = data.price.filter((p: any) => 
        new Date(p.time).getTime() >= cutoffTime
      );
    }

    return filtered.map((p: any, idx: number) => {
      const oi = data.open_interest_aggregated?.find((d: any) => d.time === p.time);
      const ls = data.long_short_ratio?.find((d: any) => d.time === p.time);
      const ta = data.top_account_ratio?.find((d: any) => d.time === p.time);
      const tp = data.top_position_ratio?.find((d: any) => d.time === p.time);

      // 计算与上一条数据的变化
      const prev = idx > 0 ? filtered[idx - 1] : null;
      const prevOi = data.open_interest_aggregated?.find((d: any) => d.time === (prev ? prev.time : null));
      const prevLs = data.long_short_ratio?.find((d: any) => d.time === (prev ? prev.time : null));
      const prevTa = data.top_account_ratio?.find((d: any) => d.time === (prev ? prev.time : null));
      const prevTp = data.top_position_ratio?.find((d: any) => d.time === (prev ? prev.time : null));

      const priceChange = prev ? ((p.value - prev.value) / prev.value * 100) : 0;
      const oiChange = (prevOi && oi) ? ((oi.value - prevOi.value) / prevOi.value * 100) : 0;
      const lsChange = (prevLs && ls) ? ((ls.value - prevLs.value) / prevLs.value * 100) : 0;
      const taChange = (prevTa && ta) ? ((ta.value - prevTa.value) / prevTa.value * 100) : 0;
      const tpChange = (prevTp && tp) ? ((tp.value - prevTp.value) / prevTp.value * 100) : 0;

      return {
        time: p.time,
        price: p.value,
        priceChange,
        oi: oi?.value,
        oiChange,
        ls: ls?.value,
        lsChange,
        ta: ta?.value,
        taChange,
        tp: tp?.value,
        tpChange
      };
    }).reverse(); // 最新的在前
  }, [data, timeRange]);

  // 计算分页
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  // 重置页码当数据变化时
  useMemo(() => {
    setCurrentPage(1);
  }, [coinSymbol, timeRange, customDateRange]);

  const ValueWithChange = ({ value, change, prefix = '', suffix = '' }: any) => (
    <div className="flex items-center justify-end gap-1">
      <span className="font-mono">{prefix}{value}{suffix}</span>
      {change !== 0 && (
        <span className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '▲' : '▼'}
        </span>
      )}
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <img 
          src={`/icons/${coinSymbol}.png`} 
          alt={coinSymbol}
          className="w-6 h-6 object-contain"
        />
        <span>{coinSymbol} 详细数据</span>
      </h3>
      {/* 日期范围提示 */}
      {(customDateRange.start || customDateRange.end) && (
        <div className="text-xs text-blue-600 mb-2">
          📅 自定义日期范围: {customDateRange.start?.toLocaleDateString('zh-CN') || '开始'} - {customDateRange.end?.toLocaleDateString('zh-CN') || '现在'}
        </div>
      )}
      {tableData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <p className="text-lg mb-2">📭 该时间段暂无数据</p>
            <p className="text-sm">请选择其他日期范围或使用快速时间选择</p>
          </div>
        </div>
      ) : (
        <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">时间</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">价格</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">持仓量</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">全网多空比</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">大户账户多空比</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">大户持仓多空比</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentData.map((row: any, i: number) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                <td className="px-4 py-3 text-gray-600">
                  {new Date(row.time).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-mono font-semibold ${row.priceChange > 0 ? 'text-green-600' : row.priceChange < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                      ${row.price?.toFixed(row.price < 1 ? 8 : 5)}
                    </span>
                    {row.priceChange !== 0 && (
                      <span className={`text-xs font-medium ${row.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.priceChange > 0 ? '▲' : '▼'} {Math.abs(row.priceChange).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-mono font-semibold ${row.oiChange > 0 ? 'text-green-600' : row.oiChange < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                      ${(row.oi / 1000000).toFixed(2)}M
                    </span>
                    {row.oiChange !== 0 && (
                      <span className={`text-xs ${row.oiChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.oiChange > 0 ? '▲' : '▼'} {Math.abs(row.oiChange).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-semibold ${row.lsChange > 0 ? 'text-green-600' : row.lsChange < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                      {row.ls?.toFixed(2)}
                    </span>
                    {row.lsChange !== 0 && (
                      <span className={`text-xs ${row.lsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.lsChange > 0 ? '▲' : '▼'} {Math.abs(row.lsChange).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-semibold ${row.taChange > 0 ? 'text-green-600' : row.taChange < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                      {row.ta?.toFixed(2)}
                    </span>
                    {row.taChange !== 0 && (
                      <span className={`text-xs ${row.taChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.taChange > 0 ? '▲' : '▼'} {Math.abs(row.taChange).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-semibold ${row.tpChange > 0 ? 'text-green-600' : row.tpChange < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                      {row.tp?.toFixed(2)}
                    </span>
                    {row.tpChange !== 0 && (
                      <span className={`text-xs ${row.tpChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.tpChange > 0 ? '▲' : '▼'} {Math.abs(row.tpChange).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 分页控件 */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">
          💡 共 {tableData.length} 条记录，每页显示 {itemsPerPage} 条
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            首页
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            下一页
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            尾页
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

