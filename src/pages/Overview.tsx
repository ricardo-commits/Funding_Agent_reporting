import { useAllResponsesTotals, useAllResponsesPositive, useAllResponsesDaily, useAllResponsesWeekday, useAllResponses, useEmailInterested, useEmailsSent, /* useSmartleadCampaigns, useSmartleadMetrics */ } from '../hooks/useDashboardData';
import { KPICard } from '../components/dashboard/KPICard';
import { FilterToolbar } from '../components/dashboard/FilterToolbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, TrendingUp, MessageCircle, Send, Target, Activity } from 'lucide-react';

export default function Overview() {
  const { data: allResponsesTotals, isLoading: loadingTotals } = useAllResponsesTotals();
  const { data: allResponsesPositive, isLoading: loadingPositive } = useAllResponsesPositive();
  const { data: allResponsesDaily, isLoading: loadingDaily } = useAllResponsesDaily();
  const { data: allResponsesWeekday, isLoading: loadingWeekday } = useAllResponsesWeekday();
  const { data: allResponses, isLoading: loadingResponses } = useAllResponses();
  const { data: interestedCount, isLoading: loadingInterested } = useEmailInterested();
  const { data: emailsSent, isLoading: loadingEmailsSent } = useEmailsSent();

  // Calculate KPIs
  const totalResponses = allResponsesTotals?.reduce((sum, channel) => sum + channel.total_responses, 0) || 0;
  const totalPositiveResponses = allResponsesPositive?.reduce((sum, channel) => sum + channel.positive_count, 0) || 0;
  const totalAllResponses = allResponsesPositive?.reduce((sum, channel) => sum + channel.total_count, 0) || 0;
  const positiveRate = totalAllResponses > 0 ? (totalPositiveResponses / totalAllResponses * 100) : 0;
  const totalEmailsSent = emailsSent?.[0]?.total_emails_sent || 0;

  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
      {/* Filter Toolbar */}
      <FilterToolbar />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total Emails Sent"
          value={totalEmailsSent}
          icon={Send}
          subtitle="Leads contacted"
        />
        <KPICard
          title="Total Responses"
          value={totalResponses}
          icon={Mail}
          subtitle="All channels"
        />
        <KPICard
          title="Positive Rate"
          value={`${positiveRate.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="Conversion rate"
        />
        <KPICard
          title="Interested"
          value={interestedCount || 0}
          icon={MessageCircle}
          subtitle="Positive responses"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Card className="shadow-sm border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Daily Responses Summary</CardTitle>
            <p className="text-sm text-muted-foreground">Recent response activity</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allResponsesDaily?.slice(0, 7).map((day, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                  <span className="text-sm text-muted-foreground">{day.received_date}</span>
                  <span className="font-medium">{day.n} responses</span>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  No daily response data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Response Labels Summary</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of response types</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allResponses?.reduce((acc, response) => {
                const label = response.response_label || 'Unknown';
                const existing = acc.find(item => item.label === label);
                if (existing) {
                  existing.count += 1;
                } else {
                  acc.push({ label, count: 1 });
                }
                return acc;
              }, [] as { label: string; count: number }[])
              ?.sort((a, b) => b.count - a.count)
              ?.slice(0, 8)
              ?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                  <span className="text-sm text-muted-foreground capitalize">{item.label.replace('_', ' ')}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  No response label data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekday Summary */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Responses by Weekday</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of responses by day of the week</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
              const dayData = allResponsesWeekday?.find(d => d.received_weekday === index + 1);
              return (
                <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{day.slice(0, 3)}</div>
                  <div className="text-lg font-bold">{dayData?.n_leads || 0}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}