import React from 'react';
import DashboardCharts from './DashboardCharts';
import type { DashboardInput } from '@/types/charts';

// Example usage - replace with your actual data
export default function ExampleUsage() {
  const chartsData: DashboardInput = {
    // 1) Responses by Weekday - either array or map
    responsesByWeekday: [47, 57, 23, 34, 45, 12, 8], // or { Mon: 47, Tue: 57, ... }
    // weekdayLabels: ['Monday', 'Tuesday', ...], // optional if not Mon..Sun

    // 2) Daily Responses Summary
    dailyLabels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'],
    dailyCounts: [4, 4, 1, 3],

    // 3) Response Labels Summary - either map or arrays
    labelTotals: { 
      'Out Of Office': 3, 
      'Not Interested': 2, 
      'Interested': 5,
      'No Response': 1
    },
    // or labelNames: ['Out Of Office', 'Not Interested', ...], labelCounts: [3, 2, ...]

    // 4) Response Label Distribution - optional precomputed percentages
    // labelPercents: [27.3, 18.2, 45.5, 9.1], // aligned to labelNames

    // 5) Top 5 Campaigns Performance - either objects or arrays
    topCampaigns: [
      { name: 'Campaign A', totalReplies: 15, positiveReplies: 8 },
      { name: 'Campaign B', totalReplies: 12, positiveReplies: 6 },
      { name: 'Campaign C', totalReplies: 10, positiveReplies: 4 },
      { name: 'Campaign D', totalReplies: 8, positiveReplies: 3 },
      { name: 'Campaign E', totalReplies: 6, positiveReplies: 2 }
    ]
    // or topCampaignNames: ['Campaign A', ...], topCampaignTotals: [15, ...], topCampaignPositives: [8, ...]
  };

  return <DashboardCharts data={chartsData} />;
}
