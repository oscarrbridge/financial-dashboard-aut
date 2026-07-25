'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Wrapper } from '@/app/components/ui/ui';

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

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = echarts.init(chartContainer.current);

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
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
  }, [categories, series]);

  return (
    <Wrapper className="w-full">
      <div ref={chartContainer} style={{ width: '100%', height }} />
    </Wrapper>
  );
}
