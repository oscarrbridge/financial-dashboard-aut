'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { InfoTooltip, NoData } from '@/app/components/ui/ui';

type PieChartSlice = {
  name: string;
  value: number;
  color?: string;
};

type PieChartProps = {
  data: PieChartSlice[];
  height?: number;
};

export default function PieChart({ data, height = 320 }: PieChartProps) {
  const chartContainer = useRef<HTMLDivElement>(null);
  const hasData = data.some(d => d.value > 0);

  useEffect(() => {
    if (!chartContainer.current || !hasData) return;

    const chart = echarts.init(chartContainer.current);

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const { name, value, percent } = params as { name: string; value: number; percent: number };
          return `${name}: ${value.toFixed(2)} (${percent.toFixed(2)}%)`;
        },
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#ccc' },
      },
      series: [{
        type: 'pie',
        radius: '70%',
        center: ['35%', '50%'],
        label: { show: false },
        data: data.map(d => ({
          name: d.name,
          value: d.value,
          itemStyle: d.color ? { color: d.color } : undefined,
        })),
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data, hasData]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <InfoTooltip text="A pie chart. Each slice represents a category, sized proportionally to its share of the total." />
      {hasData ? (
        <div ref={chartContainer} style={{ width: '100%', height }} />
      ) : (
        <NoData height={height} />
      )}
    </div>
  );
}
