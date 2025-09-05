import React from 'react';
import { useCdnChart } from './useCdnChart';
import { useTheme } from '../../contexts/ThemeContext';
import type { CampaignSplitEmail } from '@/types/dashboard';

type Props = {
  campaigns: CampaignSplitEmail[];
  className?: string;
};

export const CampaignPerformanceChart: React.FC<Props> = ({ campaigns, className }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#f3f4f6' : '#374151'; // gray-100 : gray-700
  const titleColor = theme === 'dark' ? '#f9fafb' : '#111827'; // gray-50 : gray-900
  
  const { canvasRef } = useCdnChart({
    type: 'line',
    data: {
      labels: campaigns.map(c => c.campaign_name),
      datasets: [
        {
          label: 'Total Replies',
          data: campaigns.map(c => c.total_replies),
          borderColor: 'rgb(59, 130, 246)', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Positive Replies',
          data: campaigns.map(c => c.positive_replies || 0),
          borderColor: 'rgb(34, 197, 94)', // green-500
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Top 5 Campaigns Performance',
          color: titleColor,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top',
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
            text: 'Number of Replies',
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
            text: 'Campaigns',
            color: textColor
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });

  return (
    <div className={`w-full ${className ?? ''}`}>
      <div className="h-80 w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
