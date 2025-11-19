'use client';

import { useMemo } from 'react';

interface DataTableProps {
  data: any;
  timeRange: number;
  coinSymbol: string;
}

export default function DataTable({ data, timeRange, coinSymbol }: DataTableProps) {
  const tableData = useMemo(() => {
    if (!data.price) return [];
    
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    const filtered = data.price.filter((p: any) => 
      new Date(p.time).getTime() >= cutoffTime
    );

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
        <span>📋</span>
        <span>{coinSymbol} 详细数据</span>
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
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
            {tableData.slice(0, 20).map((row: any, i: number) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
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
                    <span className="font-mono font-semibold text-gray-800">
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
      <p className="text-xs text-gray-500 mt-3">
        💡 显示最近 {Math.min(20, tableData.length)} 条记录，按时间倒序排列
      </p>
    </div>
  );
}

