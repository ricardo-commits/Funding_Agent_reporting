import React, { forwardRef } from 'react';
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  ChartType,
} from 'chart.js';
import {
  Bar,
  Line,
  Doughnut,
  Pie,
  Radar,
  PolarArea,
  Scatter,
} from 'react-chartjs-2';

export type ChartTypeUnion = 
  | 'bar' 
  | 'line' 
  | 'doughnut' 
  | 'pie' 
  | 'radar' 
  | 'polarArea' 
  | 'scatter';

export interface ChartBaseProps {
  type: ChartTypeUnion;
  data: ChartData<any, any, unknown>;
  options?: ChartOptions<any>;
  ariaLabel?: string;
  height?: number | string;
  className?: string;
}

// Component mapping
const chartComponents = {
  bar: Bar,
  line: Line,
  doughnut: Doughnut,
  pie: Pie,
  radar: Radar,
  polarArea: PolarArea,
  scatter: Scatter,
};

// Accessibility: Create a data table fallback
const DataTableFallback: React.FC<{ data: ChartData<any, any, unknown>; ariaLabel: string }> = ({ data, ariaLabel }) => {
  if (!data.labels || !data.datasets) return null;

  return (
    <div className="sr-only" aria-label={`Data table for ${ariaLabel}`}>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            {data.datasets.map((dataset, index) => (
              <th key={index}>{dataset.label || `Series ${index + 1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.labels.map((label, index) => (
            <tr key={index}>
              <td>{label}</td>
              {data.datasets.map((dataset, datasetIndex) => (
                <td key={datasetIndex}>
                  {Array.isArray(dataset.data) ? dataset.data[index] : 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ChartBase = forwardRef<ChartJS, ChartBaseProps>(
  ({ type, data, options = {}, ariaLabel, height, className }, ref) => {
    const ChartComponent = chartComponents[type];
    
    if (!ChartComponent) {
      console.error(`Unsupported chart type: ${type}`);
      return null;
    }

    // Generate ariaLabel if not provided
    const chartAriaLabel = ariaLabel || 
      `${type} chart showing ${data.datasets?.map(d => d.label).filter(Boolean).join(', ')}`;

    // Merge options with responsive defaults
    const chartOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
        },
        tooltip: {
          enabled: true,
        },
      },
      ...options,
    };

    return (
      <div 
        className={className}
        style={{ height: height || '400px' }}
        role="img"
        aria-label={chartAriaLabel}
      >
        <ChartComponent
          ref={ref}
          data={data}
          options={chartOptions}
        />
        <DataTableFallback data={data} ariaLabel={chartAriaLabel} />
      </div>
    );
  }
);

ChartBase.displayName = 'ChartBase';
