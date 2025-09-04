import React from 'react';
import { ChartBase, ChartBaseProps } from './ChartBase';
import { ChartOptions } from 'chart.js';

export interface LineChartProps extends Omit<ChartBaseProps, 'type'> {
  fill?: boolean;
  tension?: number;
  showPoints?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  options = {}, 
  fill = false,
  tension = 0.3,
  showPoints = true,
  ...props 
}) => {
  // Merge line-specific options
  const lineOptions: ChartOptions<'line'> = {
    scales: {
      x: {
        type: 'category',
        display: true,
        grid: {
          display: true,
          color: '#e5e7eb', // Light gray
          opacity: 0.2,
        },
        ticks: {
          color: '#6b7280', // Gray
          font: {
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        display: true,
        beginAtZero: true,
        grid: {
          display: true,
          color: '#e5e7eb', // Light gray
          opacity: 0.2,
        },
        ticks: {
          color: '#6b7280', // Gray
          font: {
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
    },
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
      },
    },
    elements: {
      line: {
        tension,
      },
      point: {
        radius: showPoints ? 4 : 0,
        hoverRadius: 6,
      },
    },
    ...options,
  };

  // Apply fill to datasets if requested
  if (fill && data.datasets) {
    data.datasets.forEach(dataset => {
      dataset.fill = true;
      dataset.backgroundColor = dataset.borderColor || '#3B82F6'; // Default blue
    });
  }

  return (
    <ChartBase
      type="line"
      data={data}
      options={lineOptions}
      {...props}
    />
  );
};
