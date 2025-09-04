import React from 'react';
import { ChartBase, ChartBaseProps } from './ChartBase';
import { ChartData, ChartOptions } from 'chart.js';

export interface BarChartProps extends Omit<ChartBaseProps, 'type'> {
  stacked?: boolean;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  options = {}, 
  stacked = false,
  horizontal = false,
  ...props 
}) => {
  // Merge bar-specific options
  const barOptions: ChartOptions<'bar'> = {
    indexAxis: horizontal ? 'y' : 'x',
    scales: {
      x: {
        type: horizontal ? 'linear' : 'category',
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
          ...(horizontal && {
            stepSize: 10,
            maxTicksLimit: 8,
          }),
        },
        border: {
          display: false,
        },
        beginAtZero: true,
        ...(horizontal && {
          min: 0,
          suggestedMax: 80, // Accommodate max value of ~68
        }),
      },
      y: {
        type: horizontal ? 'category' : 'linear',
        display: true,
        grid: {
          display: horizontal,
          color: '#e5e7eb', // Light gray
          opacity: 0.2,
        },
        ticks: {
          color: '#6b7280', // Gray
          font: {
            size: horizontal ? 11 : 12,
          },
          ...(horizontal && {
            maxRotation: 0,
            callback: function(value, index, values) {
              // Truncate long campaign names for better display
              const label = this.getLabelForValue(value);
              if (typeof label === 'string' && label.length > 25) {
                return label.substring(0, 22) + '...';
              }
              return label;
            },
          }),
          ...(!horizontal && {
            stepSize: 10,
            maxTicksLimit: 8,
          }),
        },
        border: {
          display: false,
        },
        beginAtZero: true,
        ...(!horizontal && {
          min: 0,
          suggestedMax: 80,
        }),
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
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
          padding: 20,
          usePointStyle: true,
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
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.x || context.parsed.y}`;
          },
        },
      },
    },
    ...options,
  };

  // Add stacking if requested
  if (stacked && data.datasets) {
    const stackId = 'stack-0'; // Use same stack ID for all datasets
    data.datasets.forEach((dataset) => {
      dataset.stack = stackId;
    });
    
    // Add stacking configuration to scales
    if (horizontal) {
      barOptions.scales!.x!.stacked = true;
      barOptions.scales!.y!.stacked = true;
    } else {
      barOptions.scales!.x!.stacked = true;
      barOptions.scales!.y!.stacked = true;
    }
  }

  return (
    <ChartBase
      type="bar"
      data={data}
      options={barOptions}
      {...props}
    />
  );
};
