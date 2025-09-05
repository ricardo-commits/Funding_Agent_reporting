import React from 'react';
import { BarBasic, LineBasic, DoughnutBasic } from './CdnCharts';
import type { DashboardInput, KVNum, TopCampaign } from '@/types/charts';

// Helpers that never throw
const WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function normalizeWeekday(labels?: string[], data?: number[] | KVNum) {
  if (Array.isArray(data)) {
    const labs = labels && labels.length === data.length ? labels : WEEK;
    return { labels: labs, values: data };
  }
  if (data && typeof data === 'object') {
    const labs = labels && labels.length ? labels : WEEK;
    return { labels: labs, values: labs.map(l => data[l] ?? 0) };
  }
  return { labels: labels ?? WEEK, values: Array((labels ?? WEEK).length).fill(0) };
}

function normalizeLabels(names?: string[], counts?: number[], totalsMap?: KVNum) {
  if (names && counts && names.length === counts.length) return { labels: names, values: counts };
  if (totalsMap) {
    const entries = Object.entries(totalsMap);
    const labels = names && names.length ? names : entries.map(([k]) => k);
    const map = new Map(entries);
    const values = labels.map(l => map.get(l) ?? 0);
    return { labels, values };
  }
  return { labels: names ?? [], values: counts ?? [] };
}

function normalizeDistribution(names: string[], percents?: number[], totals?: number[]) {
  if (percents && percents.length === names.length) return percents;
  if (totals && totals.length === names.length) {
    const sum = totals.reduce((a, b) => a + b, 0) || 1;
    return totals.map(v => Math.round((v / sum) * 1000) / 10);
  }
  return new Array(names.length).fill(0);
}

function normalizeCampaigns(list?: TopCampaign[], names?: string[], totals?: number[], positives?: number[]) {
  if (list && list.length) {
    const labs = list.map(c => c.name);
    const tot = list.map(c => c.totalReplies ?? 0);
    const pos = list.map(c => c.positiveReplies ?? 0);
    return { labels: labs, totals: tot, positives: pos };
  }
  if (names && totals && positives && names.length === totals.length && totals.length === positives.length) {
    return { labels: names, totals, positives };
  }
  return { labels: [], totals: [], positives: [] };
}

type Props = { data: DashboardInput };

export default function DashboardCharts({ data }: Props) {
  // 1) Responses by Weekday
  const week = normalizeWeekday(data.weekdayLabels, data.responsesByWeekday);

  // 2) Daily Responses Summary
  const dailyLabels = data.dailyLabels ?? [];
  const dailyCounts = data.dailyCounts ?? new Array(dailyLabels.length).fill(0);

  // 3) Response Labels Summary
  const summary = normalizeLabels(data.labelNames, data.labelCounts, data.labelTotals);

  // 4) Response Label Distribution
  const distribution = normalizeDistribution(summary.labels, data.labelPercents, summary.values);

  // 5) Top 5 Campaigns Performance
  const campaigns = normalizeCampaigns(
    data.topCampaigns,
    data.topCampaignNames,
    data.topCampaignTotals,
    data.topCampaignPositives
  );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Funding Agent Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BarBasic title="Responses by Weekday" labels={week.labels} values={week.values} />
        <LineBasic title="Daily Responses Summary" labels={dailyLabels} values={dailyCounts} />
        <BarBasic title="Response Labels Summary" labels={summary.labels} values={summary.values} />
        <DoughnutBasic title="Response Label Distribution" labels={summary.labels} values={distribution} />
        <div className="md:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
          <BarBasic title="Top 5 Campaigns, Total Replies" labels={campaigns.labels} values={campaigns.totals} />
          <BarBasic title="Top 5 Campaigns, Positive Replies" labels={campaigns.labels} values={campaigns.positives} />
        </div>
      </div>
    </div>
  );
}
