import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

export default function PieChartJS({ data, size = 180 }: { data: { label: string; value: number }[]; size?: number }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: [
          '#60a5fa', '#f59e42', '#34d399', '#f87171', '#a78bfa', '#fbbf24', '#10b981', '#f472b6', '#818cf8', '#fca5a5',
        ],
        borderWidth: 1,
      },
    ],
  };
  return <Pie data={chartData} width={size} height={size} options={{ plugins: { legend: { display: true } } }} />;
}
