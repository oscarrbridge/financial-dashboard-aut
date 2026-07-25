'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

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

  useEffect(() => {
    if (!chartContainer.current) return;

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
  }, [nodes, links]);

  return <div ref={chartContainer} style={{ width: '100%', height }} />;
}
