'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_HEX_COLORS } from '@/lib/admin-chart-colors';

export interface LineChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
}

interface AdminLineChartProps {
  data: LineChartDataPoint[];
  summaryMetric?: { label: string; value: string | number };
  dateRangeSelector?: React.ReactNode;
  title?: string;
  valueLabel?: string;
  height?: number;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: LineChartDataPoint }>;
  label?: string;
  valueLabel?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  const prev = point.payload.previousValue;
  const change = prev && prev > 0 ? ((point.value - prev) / prev) * 100 : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="text-slate-900 font-semibold">
        {point.value.toLocaleString()} {valueLabel}
      </p>
      {change !== null && (
        <p className={change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </p>
      )}
    </div>
  );
}

export default function AdminLineChart({
  data,
  summaryMetric,
  dateRangeSelector,
  title,
  valueLabel = '',
  height = 240,
  color = CHART_HEX_COLORS.primary,
}: AdminLineChartProps) {
  const chartData = useMemo(
    () => data.map((d) => ({ name: d.label, value: d.value, previousValue: d.previousValue })),
    [data]
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-3 gap-4">
        <div>
          {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
          {summaryMetric && (
            <div className="mt-1">
              <span className="text-xs text-slate-500">{summaryMetric.label}</span>
              <p className="text-lg font-bold text-slate-900">{summaryMetric.value}</p>
            </div>
          )}
        </div>
        {dateRangeSelector}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} width={40} />
          <Tooltip content={<CustomTooltip valueLabel={valueLabel} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
