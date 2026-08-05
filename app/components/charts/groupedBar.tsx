'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Wrapper, InfoTooltip, NoData } from '@/app/components/ui/ui';

type GroupedBarSeries = {
  name: string;
  data: number[];
  color?: string;
};

type GroupedBarProps = {
  categories: string[];
  series: GroupedBarSeries[];
  height?: number;
};

export default function GroupedBar({ categories, series, height = 320 }: GroupedBarProps) {
  const chartContainer = useRef<HTMLDivElement>(null);
  const hasData = categories.length > 0 && series.some(s => s.data.some(v => v > 0));

  useEffect(() => {
    if (!chartContainer.current || !hasData) return;

    const chart = echarts.init(chartContainer.current);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const items = params as { axisValue: string; marker: string; seriesName: string; value: number }[];
          const rows = items.map(p => `${p.marker}${p.seriesName}: ${p.value.toFixed(2)}`).join('<br/>');
          return `${items[0]?.axisValue ?? ''}<br/>${rows}`;
        },
      },
      legend: { data: series.map(s => s.name), top: 0, left: 'center', textStyle: { color: '#ccc' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: 60, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#ccc', rotate: 90 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#ccc' },
      },
      series: series.map(s => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        itemStyle: s.color ? { color: s.color } : undefined,
      })),
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [categories, series, hasData]);

  return (
    <Wrapper className="w-full" style={{ position: 'relative' }}>
      <InfoTooltip text="A grouped bar chart. Bars of the same color belong to one series, clustered by category for side-by-side comparison." />
      {hasData ? (
        <div ref={chartContainer} style={{ width: '100%', height }} />
      ) : (
        <NoData height={height} />
      )}
    </Wrapper>
  );
}
