import React from 'react';
import { ChartBase, ChartBaseProps } from './ChartBase';
import { ChartOptions } from 'chart.js';

export interface PieChartProps extends Omit<ChartBaseProps, 'type'> {
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  options = {}, 
  innerRadius = 0,
  outerRadius = 100,
  paddingAngle = 0,
  ...props 
}) => {
  // Merge pie-specific options
  const pieOptions: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#374151', // Dark gray
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#ffffff',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#d1d5db',
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    ...options, // Merge custom options last to allow override
  };

  // Apply radius and padding to datasets
  if (data.datasets) {
    data.datasets.forEach(dataset => {
      dataset.borderWidth = 0;
      if (innerRadius > 0) {
        dataset.innerRadius = innerRadius;
      }
      if (outerRadius !== 100) {
        dataset.outerRadius = outerRadius;
      }
      if (paddingAngle > 0) {
        dataset.paddingAngle = paddingAngle;
      }
    });
  }

  return (
    <ChartBase
      type="pie"
      data={data}
      options={pieOptions}
      {...props}
    />
  );
};
