'use client';

import { useMemo } from 'react';

interface DataTableProps {
  data: any;
  timeRange: number;
}

export default function DataTable({ data, timeRange }: DataTableProps) {
  const tableData = useMemo(() => {
    if (!data.price) return [];
    
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;
    const filtered = data.price.filter((p: any) => 
      new Date(p.time).getTime() >= cutoffTime
    );

    return filtered.map((p: any) => {
      const oi = data.open_interest_aggregated?.find((d: any) => d.time === p.time);
      const ls = data.long_short_ratio?.find((d: any) => d.time === p.time);
      const ta = data.top_account_ratio?.find((d: any) => d.time === p.time);
      const tp = data.top_position_ratio?.find((d: any) => d.time === p.time);

      return {
        time: p.time,
        price: p.value,
        oi: oi?.value,
        ls: ls?.value,
        ta: ta?.value,
        tp: tp?.value
      };
    }).reverse(); // 最新的在前
  }, [data, timeRange]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📋 详细数据</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">时间</th>
              <th className="px-4 py-2 text-right">价格</th>
              <th className="px-4 py-2 text-right">持仓量</th>
              <th className="px-4 py-2 text-right">全网多空比</th>
              <th className="px-4 py-2 text-right">大户账户</th>
              <th className="px-4 py-2 text-right">大户持仓</th>
            </tr>
          </thead>
          <tbody>
            {tableData.slice(0, 20).map((row: any, i: number) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{new Date(row.time).toLocaleString('zh-CN')}</td>
                <td className="px-4 py-2 text-right font-mono">${row.price?.toFixed(8)}</td>
                <td className="px-4 py-2 text-right">${(row.oi / 1000000).toFixed(2)}M</td>
                <td className="px-4 py-2 text-right">{row.ls?.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{row.ta?.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{row.tp?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

