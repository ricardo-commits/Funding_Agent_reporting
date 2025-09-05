import React, { useState, useRef } from 'react';
import { useCdnChart } from './useCdnChart';
import { useTheme } from '../../contexts/ThemeContext';

type LabelData = {
  name: string;
  value: number;
};

type Props = {
  labelData: LabelData[];
  className?: string;
};

export const ResponseLabelPieChart: React.FC<Props> = ({ labelData, className }) => {
  const { theme } = useTheme();
  const [hiddenSegments, setHiddenSegments] = useState<Set<number>>(new Set());
  
  // Theme-aware colors
  const textColor = theme === 'dark' ? '#f3f4f6' : '#374151'; // gray-100 : gray-700 (lighter for dark mode)
  const titleColor = theme === 'dark' ? '#f9fafb' : '#111827'; // gray-50 : gray-900
  
  // Shared color palette - ensure exact match between chart and legend
  const chartColors = {
    backgroundColor: [
      'rgba(34, 197, 94, 0.8)',   // green-500 - Interested
      'rgba(59, 130, 246, 0.8)',  // blue-500 - Referral
      'rgba(239, 68, 68, 0.8)',   // red-500 - Not Interested
      'rgba(245, 158, 11, 0.8)',  // amber-500 - Out of office
      'rgba(107, 114, 128, 0.8)', // gray-500 - Wrong person
      'rgba(139, 69, 19, 0.8)',   // brown - Do not contact
      'rgba(168, 85, 247, 0.8)',  // purple-500 - Other
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
      'rgba(34, 197, 94, 0.8)',   // green-500 - Interested
      'rgba(59, 130, 246, 0.8)',  // blue-500 - Referral
      'rgba(239, 68, 68, 0.8)',   // red-500 - Not Interested
      'rgba(245, 158, 11, 0.8)',  // amber-500 - Out of office
      'rgba(107, 114, 128, 0.8)', // gray-500 - Wrong person
      'rgba(139, 69, 19, 0.8)',   // brown - Do not contact
      'rgba(168, 85, 247, 0.8)',  // purple-500 - Other
    ]
  };
  
  const { canvasRef, chartRef: hookChartRef } = useCdnChart({
    type: 'pie',
    data: {
      labels: labelData.map(item => item.name),
      datasets: [
        {
          data: labelData.map(item => item.value),
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.borderColor,
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Response Label Distribution',
          color: titleColor,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false // Disable built-in legend
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? '#374151' : '#ffffff', // gray-700 : white
          titleColor: titleColor,
          bodyColor: textColor,
          borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db', // gray-500 : gray-300
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
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
    if (hookChartRef.current) {
      const chart = hookChartRef.current;
      const meta = chart.getDatasetMeta(0);
      if (meta.data[index]) {
        meta.data[index].hidden = newHiddenSegments.has(index);
        chart.update();
      }
    }
  };

  // Calculate total for percentages (excluding hidden segments)
  const total = labelData.reduce((sum, item, index) => 
    hiddenSegments.has(index) ? sum : sum + item.value, 0);

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
          {labelData.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            const isHidden = hiddenSegments.has(index);
            
            return (
              <div 
                key={item.name} 
                className={`flex items-center gap-2 p-2 rounded-md bg-muted/30 cursor-pointer transition-all hover:bg-muted/50 ${
                  isHidden ? 'opacity-50' : ''
                }`}
                onClick={() => handleLegendClick(index)}
              >
                <div 
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ 
                    backgroundColor: isHidden ? '#9ca3af' : chartColors.legendColors[index],
                    opacity: isHidden ? 0.5 : 1
                  }}
                />
                <span className={`text-sm font-medium ${isHidden ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.name}
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {item.value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
