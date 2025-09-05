import React from 'react';
import { useCdnChart } from './useCdnChart';

type LabelData = {
  name: string;
  value: number;
};

type Props = {
  labelData: LabelData[];
  className?: string;
};

export const ResponseLabelPieChart: React.FC<Props> = ({ labelData, className }) => {
  const ref = useCdnChart({
    type: 'pie',
    data: {
      labels: labelData.map(item => item.name),
      datasets: [
        {
          data: labelData.map(item => item.value),
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
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'bottom',
          align: 'center',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 11
            },
            boxWidth: 12,
            boxHeight: 12,
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                
                return data.labels.map((label: string, i: number) => {
                  const value = dataset.data[i] as number;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  
                  return {
                    text: `${label}: ${value} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor[i],
                    lineWidth: dataset.borderWidth,
                    pointStyle: 'circle',
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
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

  return (
    <div className={`flex items-center justify-center ${className ?? ''}`}>
      <div className="h-80">
        <canvas ref={ref} />
      </div>
    </div>
  );
};
