import { useEmailTotals, useEmailPositive, useEmailDaily, useEmailWeekday, useEmailResponses, useEmailInterested, useEmailsSent, useSmartleadCampaigns, useSmartleadMetrics } from '../hooks/useDashboardData';
import { KPICard } from '../components/dashboard/KPICard';
import { FilterToolbar } from '../components/dashboard/FilterToolbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, DoughnutChart, BarChart, buildLineData, buildDoughnutData, buildBarData, buildTimelineData, buildWeekdayData, type DateSeriesData } from '../charts';
import { Mail, TrendingUp, MessageCircle, Send, Target, Activity } from 'lucide-react';

export default function Overview() {
  const { data: emailTotals, isLoading: loadingTotals } = useEmailTotals();
  const { data: emailPositive, isLoading: loadingPositive } = useEmailPositive();
  const { data: emailDaily, isLoading: loadingDaily } = useEmailDaily();
  const { data: emailWeekday, isLoading: loadingWeekday } = useEmailWeekday();
  const { data: emailResponses, isLoading: loadingResponses } = useEmailResponses();
  const { data: interestedCount, isLoading: loadingInterested } = useEmailInterested();
  const { data: emailsSent, isLoading: loadingEmailsSent } = useEmailsSent();
  const { data: smartleadCampaigns, isLoading: loadingSmartlead } = useSmartleadCampaigns();
  const { data: smartleadMetrics, isLoading: loadingSmartleadMetrics } = useSmartleadMetrics();

  // Calculate KPIs
  const totalEmailResponses = emailTotals?.[0]?.total_replies || 0;
  const emailPositiveRate = emailPositive?.[0] ? 
    (emailPositive[0].positive_replies / emailPositive[0].total_replies * 100) : 0;
  const totalEmailsSent = emailsSent?.[0]?.total_emails_sent || 0;

  // Smartlead KPIs
  const smartleadTotalSent = smartleadMetrics?.total_sent || 0;
  const smartleadTotalReplies = smartleadMetrics?.total_replies || 0;
  const smartleadReplyRate = smartleadMetrics?.average_reply_rate || 0;
  const smartleadActiveCampaigns = smartleadMetrics?.active_campaigns || 0;

  // Prepare chart data
  const responseLabelData = emailResponses?.reduce((acc, response) => {
    const label = response.response_label;
    const existing = acc.find(item => item.name === label);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: label, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]) || [];

  // Transform data for enhanced Chart.js with ISO dates and weekday indices
  
  // Enhanced daily chart with ISO dates and weekday display
  const dailyTimelineData: DateSeriesData[] = emailDaily ? [{
    label: 'Daily Responses',
    data: emailDaily
      .filter(item => item.received_date && item.count !== undefined)
      .map(item => ({
        x: item.isoDate || item.received_date,
        y: item.count,
        date: item.dateObject,
        weekday: item.weekday
      }))
  }] : [];

  const dailyChartData = emailDaily && emailDaily.length > 0 
    ? buildTimelineData(dailyTimelineData, { 
        displayWeekdays: true, 
        dateFormat: 'short' 
      })
    : buildLineData(['No Data'], [{ label: 'No Data', data: [0] }]);

  // Enhanced weekday chart using raw weekday indices
  const weekdayChartData = emailWeekday && emailWeekday.length > 0
    ? buildWeekdayData(
        emailWeekday.map(item => ({
          weekday: typeof item.weekday === 'number' ? item.weekday : item.weekdayIndex || 1,
          count: item.count
        })),
        'Responses by Weekday'
      )
    : buildBarData(['No Data'], [{ label: 'No Data', data: [0] }]);

  const responseChartData = buildDoughnutData(
    responseLabelData.map(item => item.name).filter(Boolean),
    responseLabelData.map(item => item.value).filter(Boolean),
    'Response Labels'
  );

  // Create fallback data for empty charts
  const fallbackLineData = buildLineData(['No Data'], [{ label: 'No Data', data: [0] }]);
  const fallbackDoughnutData = buildDoughnutData(['No Data'], [1], 'No Data');
  const fallbackBarData = buildBarData(['No Data'], [{ label: 'No Data', data: [0] }]);

  // Check if we have valid data for charts
  const hasDailyData = dailyChartData.labels.length > 0 && 
                      dailyChartData.datasets.length > 0 && 
                      dailyChartData.datasets[0].data.length > 0;
  
  const hasResponseData = responseChartData.labels.length > 0 && 
                         responseChartData.datasets.length > 0 && 
                         responseChartData.datasets[0].data.length > 0;
  
  const hasWeekdayData = weekdayChartData.labels.length > 0 && 
                        weekdayChartData.datasets.length > 0 && 
                        weekdayChartData.datasets[0].data.length > 0;



  // Customize the doughnut chart legend to show response label numbers
  const customDoughnutOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 0,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
          color: '#374151', // Dark gray
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="p-6 space-y-8">
      {/* Filter Toolbar */}
      <FilterToolbar />

      {/* Row A: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Emails Sent"
          value={totalEmailsSent}
          icon={Send}
          subtitle="Leads contacted"
        />
        <KPICard
          title="Total Email Responses"
          value={totalEmailResponses}
          icon={Mail}
          subtitle="Email channel"
        />
        <KPICard
          title="Email Positive Rate"
          value={`${emailPositiveRate.toFixed(1)}%`}
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

      {/* Row A2: Smartlead KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Smartlead Total Sent"
          value={smartleadTotalSent.toLocaleString()}
          icon={Target}
          subtitle="Campaign emails sent"
        />
        <KPICard
          title="Smartlead Total Replies"
          value={smartleadTotalReplies.toLocaleString()}
          icon={MessageCircle}
          subtitle="Campaign responses"
        />
        <KPICard
          title="Smartlead Reply Rate"
          value={`${smartleadReplyRate.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="Average reply rate"
        />
        <KPICard
          title="Active Campaigns"
          value={smartleadActiveCampaigns}
          icon={Activity}
          subtitle="Campaigns with data"
        />
      </div>

      {/* Row B: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Daily Responses Line Chart with ISO dates and weekday labels */}
        <Card className="shadow-sm border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Daily Responses - Past Week</CardTitle>
            <p className="text-sm text-muted-foreground">Email responses per day with ISO dates and weekday labels</p>
          </CardHeader>
          <CardContent>
            <LineChart
              data={hasDailyData ? dailyChartData : fallbackLineData}
              height={256}
              ariaLabel="Daily email responses over the past week"
            />
          </CardContent>
        </Card>

        {/* Response Labels Donut Chart */}
        <Card className="shadow-sm border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Response Labels</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart
              data={hasResponseData ? responseChartData : fallbackDoughnutData}
              height={256}
              ariaLabel="Distribution of email response labels"
              options={customDoughnutOptions}
            />
          </CardContent>
        </Card>
      </div>

      {/* Row C: Enhanced Responses by Weekday using weekday indices */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Responses by Weekday</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution using database weekday indices (1-7)</p>
        </CardHeader>
        <CardContent>
          <BarChart
            data={hasWeekdayData ? weekdayChartData : fallbackBarData}
            height={320}
            horizontal={true}
            ariaLabel="Email responses distribution by weekday"
          />
        </CardContent>
      </Card>

      {/* Row D: Smartlead Campaign Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaign Performance Bar Chart */}
        <Card className="shadow-sm border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Smartlead Campaign Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Sent vs Replies by campaign</p>
          </CardHeader>
          <CardContent>
            <BarChart
              data={smartleadCampaigns && smartleadCampaigns.length > 0 ? {
                labels: smartleadCampaigns
                  .filter(c => c.sent_count && c.sent_count > 0)
                  .map(c => c.campaign_name.replace('Funding Agent: ', '')),
                datasets: [
                  {
                    label: 'Sent',
                    data: smartleadCampaigns
                      .filter(c => c.sent_count && c.sent_count > 0)
                      .map(c => c.sent_count || 0),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                  },
                  {
                    label: 'Replies',
                    data: smartleadCampaigns
                      .filter(c => c.sent_count && c.sent_count > 0)
                      .map(c => c.reply_count || 0),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                  }
                ]
              } : fallbackBarData}
              height={256}
              ariaLabel="Smartlead campaign performance comparison"
            />
          </CardContent>
        </Card>

        {/* Campaign Reply Rates Doughnut Chart */}
        <Card className="shadow-sm border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Campaign Reply Rates</CardTitle>
            <p className="text-sm text-muted-foreground">Reply rate percentage by campaign</p>
          </CardHeader>
          <CardContent>
            <DoughnutChart
              data={smartleadCampaigns && smartleadCampaigns.length > 0 ? {
                labels: smartleadCampaigns
                  .filter(c => c.sent_count && c.sent_count > 0)
                  .map(c => c.campaign_name.replace('Funding Agent: ', '')),
                datasets: [{
                  data: smartleadCampaigns
                    .filter(c => c.sent_count && c.sent_count > 0)
                    .map(c => ((c.reply_count || 0) / (c.sent_count || 1)) * 100),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 146, 60, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(16, 185, 129, 1)'
                  ],
                  borderWidth: 2
                }]
              } : fallbackDoughnutData}
              height={256}
              ariaLabel="Smartlead campaign reply rates"
            />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}