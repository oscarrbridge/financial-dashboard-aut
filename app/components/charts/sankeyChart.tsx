'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { InfoTooltip, NoData } from '@/app/components/ui/ui';

type SankeyNode = {
  name: string;
  color?: string;
};

type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

type SankeyChartProps = {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
};

export default function SankeyChart({ nodes, links, height = 400 }: SankeyChartProps) {
  const chartContainer = useRef<HTMLDivElement>(null);
  const hasData = links.some(l => l.value > 0);

  useEffect(() => {
    if (!chartContainer.current || !hasData) return;

    const chart = echarts.init(chartContainer.current);

    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'sankey',
        data: nodes.map(n => ({
          name: n.name,
          itemStyle: n.color ? { color: n.color } : undefined,
        })),
        links,
        emphasis: { focus: 'adjacency' },
        nodeWidth: 24,
        nodeGap: 16,
        lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.6 },
        label: { color: '#fff', fontSize: 14 },
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [nodes, links, hasData]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <InfoTooltip text="Shows where your money goes. Each band flows from a source (e.g. Income) to a destination (e.g. a spending category) — the thicker the band, the more money moved along that path." />
      {hasData ? (
        <div ref={chartContainer} style={{ width: '100%', height }} />
      ) : (
        <NoData height={height} />
      )}
    </div>
  );
}
