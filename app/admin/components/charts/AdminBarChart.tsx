'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_HEX_PALETTE, getCategoryHexColor } from '@/lib/admin-chart-colors';

export interface BarChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  icon?: React.ReactNode;
  category?: string;
}

interface AdminBarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  valueLabel?: string;
  secondaryLabel?: string;
  height?: number;
  showContextToggle?: boolean;
}

function CustomBarLabel({ x, y, payload }: { x?: number; y?: number; payload?: BarChartDataPoint }) {
  if (!payload?.icon || x === undefined || y === undefined) return null;
  return (
    <foreignObject x={x - 12} y={y + 4} width={24} height={24}>
      <div className="w-6 h-6 flex items-center justify-center">{payload.icon}</div>
    </foreignObject>
  );
}

export default function AdminBarChart({
  data,
  title,
  valueLabel = '',
  secondaryLabel = '',
  height = 240,
  showContextToggle = false,
}: AdminBarChartProps) {
  const [context, setContext] = useState<'primary' | 'secondary'>('primary');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = data.map((d, i) => ({
    name: d.label,
    value: context === 'primary' ? d.value : (d.secondaryValue ?? d.value),
    icon: d.icon,
    category: d.category,
    index: i,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
        {showContextToggle && (
          <div className="flex rounded-lg border border-slate-200 text-xs overflow-hidden">
            <button
              onClick={() => setContext('primary')}
              className={`px-3 py-1.5 ${context === 'primary' ? 'bg-primary text-white' : 'text-slate-600'}`}
            >
              {valueLabel}
            </button>
            <button
              onClick={() => setContext('secondary')}
              className={`px-3 py-1.5 ${context === 'secondary' ? 'bg-primary text-white' : 'text-slate-600'}`}
            >
              {secondaryLabel}
            </button>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            width={80}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(value) => [
              typeof value === 'number' ? value.toLocaleString() : String(value ?? ''),
              context === 'primary' ? valueLabel : secondaryLabel,
            ]}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {chartData.map((entry, index) => {
              const color = getCategoryHexColor(entry.category ?? entry.name, index);
              const opacity = activeIndex === null || activeIndex === index ? 1 : 0.3;
              return <Cell key={index} fill={color} fillOpacity={opacity} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
