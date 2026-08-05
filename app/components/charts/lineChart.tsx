'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { InfoTooltip, NoData } from '@/app/components/ui/ui';

type LineChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  data: LineChartPoint[];
  color?: string;
  height?: number;
};

export default function LineChart({ data, color = '#4ade80', height = 160 }: LineChartProps) {
  const chartContainer = useRef<HTMLDivElement>(null);
  const hasData = data.some(d => d.value > 0);

  useEffect(() => {
    if (!chartContainer.current || !hasData) return;

    const chart = echarts.init(chartContainer.current);

    chart.setOption({
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: {
        type: 'category',
        data: data.map(d => d.label),
        show: false,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        show: false,
        scale: true,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const point = (params as { name: string; value: number }[])[0];
          return `${point.name}: ${point.value}`;
        },
      },
      series: [{
        type: 'line',
        data: data.map(d => d.value),
        step: 'end',
        symbol: 'none',
        lineStyle: { color, width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}55` },
            { offset: 1, color: `${color}00` },
          ]),
        },
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data, color, hasData]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <InfoTooltip text="A line chart showing how a value changes over time, read left to right." />
      {hasData ? (
        <div ref={chartContainer} style={{ width: '100%', height }} />
      ) : (
        <NoData height={height} />
      )}
    </div>
  );
}
