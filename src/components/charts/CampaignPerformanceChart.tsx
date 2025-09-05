import React from 'react';
import { useCdnChart } from './useCdnChart';
import type { CampaignSplitEmail } from '@/types/dashboard';

type Props = {
  campaigns: CampaignSplitEmail[];
  className?: string;
};

export const CampaignPerformanceChart: React.FC<Props> = ({ campaigns, className }) => {
  const ref = useCdnChart({
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
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          },
          title: {
            display: true,
            text: 'Number of Replies'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Campaigns'
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
        <canvas ref={ref} />
      </div>
    </div>
  );
};
