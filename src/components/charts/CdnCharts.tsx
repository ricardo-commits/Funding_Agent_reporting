import React, { useState } from 'react';
import { useCdnChart } from './useCdnChart';
import { useTheme } from '../../contexts/ThemeContext';

type BasicProps = {
  title: string;
  labels: string[];
  values: number[];
  className?: string;
};

export const BarBasic: React.FC<BasicProps> = ({ title, labels, values, className }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#f3f4f6' : '#374151'; // gray-100 : gray-700 (lighter for dark mode)
  const titleColor = theme === 'dark' ? '#f9fafb' : '#111827';
  
  const { canvasRef } = useCdnChart({
    type: 'bar',
    data: { labels, datasets: [{ label: title, data: values }] },
    options: {
      responsive: true,
      plugins: { 
        title: { 
          display: true, 
          text: title,
          color: titleColor
        }, 
        legend: { display: false } 
      },
      scales: { 
        y: { 
          beginAtZero: true, 
          ticks: { 
            precision: 0,
            color: textColor
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          }
        }
      }
    }
  });
  return <div className={`flex items-center justify-center ${className ?? ''}`}><canvas ref={canvasRef} /></div>;
};

export const LineBasic: React.FC<BasicProps> = ({ title, labels, values, className }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#f3f4f6' : '#374151'; // gray-100 : gray-700 (lighter for dark mode)
  const titleColor = theme === 'dark' ? '#f9fafb' : '#111827';
  
  const { canvasRef } = useCdnChart({
    type: 'line',
    data: { labels, datasets: [{ label: title, data: values, tension: 0.3, pointRadius: 2 }] },
    options: {
      responsive: true,
      plugins: { 
        title: { 
          display: true, 
          text: title,
          color: titleColor
        }, 
        legend: { display: false } 
      },
      scales: { 
        y: { 
          beginAtZero: true, 
          ticks: { 
            precision: 0,
            color: textColor
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          }
        }
      }
    }
  });
  return <div className={`flex items-center justify-center ${className ?? ''}`}><canvas ref={canvasRef} /></div>;
};

export const DoughnutBasic: React.FC<BasicProps> = ({ title, labels, values, className }) => {
  const { theme } = useTheme();
  const [hiddenSegments, setHiddenSegments] = useState<Set<number>>(new Set());
  const textColor = theme === 'dark' ? '#f3f4f6' : '#374151'; // gray-100 : gray-700 (lighter for dark mode)
  const titleColor = theme === 'dark' ? '#f9fafb' : '#111827';
  
  // Shared color palette - ensure exact match between chart and legend
  const chartColors = {
    backgroundColor: [
      'rgba(34, 197, 94, 0.8)',   // green-500
      'rgba(59, 130, 246, 0.8)',  // blue-500
      'rgba(239, 68, 68, 0.8)',   // red-500
      'rgba(245, 158, 11, 0.8)',  // amber-500
      'rgba(107, 114, 128, 0.8)', // gray-500
      'rgba(139, 69, 19, 0.8)',   // brown
      'rgba(168, 85, 247, 0.8)',  // purple-500
    ],
    borderColor: [
      'rgba(34, 197, 94, 1)',     // green-500
      'rgba(59, 130, 246, 1)',    // blue-500
      'rgba(239, 68, 68, 1)',     // red-500
      'rgba(245, 158, 11, 1)',    // amber-500
      'rgba(107, 114, 128, 1)',   // gray-500
      'rgba(139, 69, 19, 1)',     // brown
      'rgba(168, 85, 247, 1)',    // purple-500
    ],
    legendColors: [
      'rgba(34, 197, 94, 0.8)',   // green-500
      'rgba(59, 130, 246, 0.8)',  // blue-500
      'rgba(239, 68, 68, 0.8)',   // red-500
      'rgba(245, 158, 11, 0.8)',  // amber-500
      'rgba(107, 114, 128, 0.8)', // gray-500
      'rgba(139, 69, 19, 0.8)',   // brown
      'rgba(168, 85, 247, 0.8)',  // purple-500
    ]
  };
  
  const { canvasRef, chartRef } = useCdnChart({
    type: 'doughnut',
    data: { 
      labels, 
      datasets: [{ 
        data: values,
        backgroundColor: chartColors.backgroundColor,
        borderColor: chartColors.borderColor,
        borderWidth: 2
      }] 
    },
    options: {
      responsive: true,
      plugins: { 
        title: { 
          display: true, 
          text: title,
          color: titleColor
        }, 
        legend: {
          display: false // Disable built-in legend
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
          titleColor: titleColor,
          bodyColor: textColor,
          borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
          borderWidth: 1
        }
      }
    }
  });
  
  // Handle legend item click
  const handleLegendClick = (index: number) => {
    const newHiddenSegments = new Set(hiddenSegments);
    if (newHiddenSegments.has(index)) {
      newHiddenSegments.delete(index);
    } else {
      newHiddenSegments.add(index);
    }
    setHiddenSegments(newHiddenSegments);
    
    // Update chart visibility using proper Chart.js method
    if (chartRef.current) {
      const chart = chartRef.current;
      const meta = chart.getDatasetMeta(0);
      if (meta.data[index]) {
        meta.data[index].hidden = newHiddenSegments.has(index);
        chart.update();
      }
    }
  };

  // Calculate total for percentages (excluding hidden segments)
  const total = values.reduce((sum, value, index) => 
    hiddenSegments.has(index) ? sum : sum + value, 0);

  return (
    <div className={`flex flex-col items-center justify-center ${className ?? ''}`}>
      {/* Chart Container - Centered */}
      <div className="flex items-center justify-center w-full mb-4">
        <div className="h-80 w-80 max-w-full">
          <canvas ref={canvasRef} />
        </div>
      </div>
      
      {/* Custom External Legend */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {labels.map((label, index) => {
            const value = values[index];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            const isHidden = hiddenSegments.has(index);
            
            return (
              <div 
                key={label} 
                className={`flex items-center gap-2 p-2 rounded-md bg-muted/30 cursor-pointer transition-all hover:bg-muted/50 ${
                  isHidden ? 'opacity-50' : ''
                }`}
                onClick={() => handleLegendClick(index)}
              >
                <div 
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ 
                    backgroundColor: isHidden ? '#9ca3af' : chartColors.legendColors[index % chartColors.legendColors.length],
                    opacity: isHidden ? 0.5 : 1
                  }}
                />
                <span className={`text-sm font-medium ${isHidden ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {label}
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type MultiBarProps = {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
  className?: string;
};

export const BarMulti: React.FC<MultiBarProps> = ({ title, labels, datasets, className }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#f3f4f6' : '#374151'; // gray-100 : gray-700 (lighter for dark mode)
  const titleColor = theme === 'dark' ? '#f9fafb' : '#111827';
  
  const { canvasRef } = useCdnChart({
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { 
        title: { 
          display: true, 
          text: title,
          color: titleColor
        },
        legend: { 
          display: true,
          position: 'top',
          align: 'center',
          labels: {
            color: textColor
          }
        }
      },
      scales: { 
        y: { 
          beginAtZero: true, 
          ticks: { 
            precision: 0,
            color: textColor
          },
          title: {
            display: true,
            text: 'Count',
            color: textColor
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          title: {
            display: true,
            text: 'Sequence',
            color: textColor
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          }
        }
      }
    }
  });
  return <div className={`flex items-center justify-center ${className ?? ''}`}><canvas ref={canvasRef} /></div>;
};