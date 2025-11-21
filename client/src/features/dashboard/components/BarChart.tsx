import React from 'react';

export default function BarChart({ data, width = 420, height = 120 }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const gap = 10;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 20);
        const x = i * (barWidth + gap);
        const y = height - h - 20;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={h} rx={6} fill="#2563eb" />
            <text x={x + barWidth / 2} y={height - 4} fontSize={11} textAnchor="middle" fill="var(--muted)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
