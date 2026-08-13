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
  referenceValue?: number;
  referenceLabel?: string;
  referenceColor?: string;
};

export default function LineChart({
  data,
  color = '#4ade80',
  height = 160,
  referenceValue,
  referenceLabel,
  referenceColor = '#f87171',
}: LineChartProps) {
  const chartContainer = useRef<HTMLDivElement>(null);
  const hasData = data.some(d => d.value > 0) || referenceValue !== undefined;

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
        min: 0,
        max:
          referenceValue !== undefined
            ? Math.max(
                referenceValue,
                ...data.map((point) => point.value)
              ) * 1.05
            : undefined,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const point = (params as { name: string; value: number }[])[0];
          return `${point.name}: ${point.value.toFixed(2)}`;
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
        ...(referenceValue !== undefined && {
          markLine: {
            symbol: 'none',
            silent: true,
            animation: false,
            lineStyle: {
              color: referenceColor,
              type: 'dashed',
              width: 1.5,
            },
            label: {
              show: !!referenceLabel,
              formatter: referenceLabel ?? '',
              color: referenceColor,
              position: 'insideEndBottom',
            },
            data: [{ yAxis: referenceValue }],
          },
        }),
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data, color, hasData, referenceValue, referenceLabel, referenceColor]);

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