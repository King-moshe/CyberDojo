import React from 'react';

type Slice = { label: string; value: number; color?: string };

export default function PieChart({ slices, size = 160 }: { slices: Slice[]; size?: number }) {
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  let angle = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.max(32, size / 2 - 8);

  const paths = slices.map((s, i) => {
    const portion = s.value / total;
    const start = angle;
    const end = angle + portion * 360;
    angle = end;
    const large = end - start > 180 ? 1 : 0;
    const a0 = (Math.PI / 180) * start;
    const a1 = (Math.PI / 180) * end;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const d = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    return (
      <path key={i} d={d} fill={s.color || ['#10b981', '#f59e0b', '#ef4444', '#2563eb'][i % 4]} stroke="#fff" />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
    </svg>
  );
}
