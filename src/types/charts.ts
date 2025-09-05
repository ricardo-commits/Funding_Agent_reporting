export type KVNum = Record<string, number>;

export type TopCampaign = {
  name: string;
  totalReplies: number;
  positiveReplies: number;
};

export type DashboardInput = {
  // 1) Responses by Weekday, accept array or map
  responsesByWeekday?: number[] | KVNum; // array ordered Mon..Sun or map { Mon:47, ... }
  weekdayLabels?: string[];              // optional explicit labels

  // 2) Daily Responses Summary
  dailyLabels?: string[];                // date strings
  dailyCounts?: number[];                // counts aligned to dailyLabels

  // 3) Response Labels Summary, totals per label
  labelTotals?: KVNum;                   // { "Out Of Office": 3, "Not Interested": 2, ... }
  labelNames?: string[];                 // optional explicit order
  labelCounts?: number[];                // optional explicit values aligned to labelNames

  // 4) Response Label Distribution, percentages per label
  labelPercents?: number[];              // aligned to labelNames if provided

  // 5) Top 5 Campaigns Performance
  topCampaigns?: TopCampaign[];          // [{ name, totalReplies, positiveReplies }, ...]
  topCampaignNames?: string[];           // optional explicit labels
  topCampaignTotals?: number[];          // optional explicit values
  topCampaignPositives?: number[];       // optional explicit values
};
