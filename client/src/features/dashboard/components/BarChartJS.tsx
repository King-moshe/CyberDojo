import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChartJS({ data, width = 300, height = 120 }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Count',
        data: data.map((d) => d.value),
        backgroundColor: '#60a5fa',
      },
    ],
  };
  return <Bar data={chartData} width={width} height={height} options={{ plugins: { legend: { display: false } } }} />;
}
