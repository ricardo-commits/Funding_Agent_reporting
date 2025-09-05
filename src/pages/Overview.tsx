import { useAllTimeResponsesTotals, useAllTimeResponsesPositive, useAllTimeResponsesDaily, useAllTimeResponsesWeekday, useAllTimeResponses, useAllTimeEmailInterested, useAllTimeEmailsSent, useAllTimeResponsesBySequence } from '../hooks/useDashboardData';
import { KPICard } from '../components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, TrendingUp, MessageCircle, Send, Target, Activity } from 'lucide-react';
import { BarBasic, LineBasic, DoughnutBasic, BarMulti } from '../components/charts/CdnCharts';
import type { DashboardInput } from '../types/charts';

export default function Overview() {
  const { data: allResponsesTotals, isLoading: loadingTotals } = useAllTimeResponsesTotals();
  const { data: allResponsesPositive, isLoading: loadingPositive } = useAllTimeResponsesPositive();
  const { data: allResponsesDaily, isLoading: loadingDaily } = useAllTimeResponsesDaily();
  const { data: allResponsesWeekday, isLoading: loadingWeekday } = useAllTimeResponsesWeekday();
  const { data: allResponses, isLoading: loadingResponses } = useAllTimeResponses();
  const { data: interestedCount, isLoading: loadingInterested } = useAllTimeEmailInterested();
  const { data: emailsSent, isLoading: loadingEmailsSent } = useAllTimeEmailsSent();
  const { data: responsesBySequence, isLoading: loadingSequence } = useAllTimeResponsesBySequence();

  // Calculate KPIs
  const totalResponses = allResponsesTotals?.reduce((sum, channel) => sum + channel.total_responses, 0) || 0;
  const totalPositiveResponses = allResponsesPositive?.reduce((sum, channel) => sum + channel.positive_count, 0) || 0;
  const totalAllResponses = allResponsesPositive?.reduce((sum, channel) => sum + channel.total_count, 0) || 0;
  const positiveRate = totalAllResponses > 0 ? (totalPositiveResponses / totalAllResponses * 100) : 0;
  const totalEmailsSent = emailsSent?.[0]?.total_emails_sent || 0;

  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
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
          <CardContent className="p-6">
            {(() => {
              // Convert daily data to chart format - show more data points
              const dailyData = allResponsesDaily || [];
              
              // Group by date to combine multiple channels for the same date
              const dateMap = new Map<string, number>();
              dailyData.forEach(day => {
                const date = day.received_date;
                dateMap.set(date, (dateMap.get(date) || 0) + day.n);
              });
              
              // Convert to arrays and sort by date
              const sortedDates = Array.from(dateMap.keys()).sort((a, b) => 
                new Date(a).getTime() - new Date(b).getTime()
              );
              
              const dailyLabels = sortedDates.map(date => {
                const dateObj = new Date(date);
                return dateObj.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                });
              });
              const dailyValues = sortedDates.map(date => dateMap.get(date) || 0);
              
              return (
                <LineBasic 
                  title="Daily Responses Summary" 
                  labels={dailyLabels} 
                  values={dailyValues}
                />
              );
            })()}
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/50">
          <CardContent className="p-6">
            {(() => {
              // Convert response labels data to chart format
              const labelData = allResponses?.reduce((acc, response) => {
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
              ?.slice(0, 8) || [];
              
              const labelLabels = labelData.map(item => item.label.replace('_', ' '));
              const labelValues = labelData.map(item => item.count);
              
              return (
                <DoughnutBasic 
                  title="Response Labels Summary" 
                  labels={labelLabels} 
                  values={labelValues}
                />
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Weekday Summary Chart */}
      <Card className="shadow-sm border border-border/50">
        <CardContent className="p-6">
          {(() => {
            // Convert weekday data to chart format
            const weekdayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const weekdayValues = weekdayLabels.map((_, index) => {
              const dayData = allResponsesWeekday?.find(d => d.received_weekday === index + 1);
              return dayData?.n_leads || 0;
            });
            
            return (
              <BarBasic 
                title="Responses by Weekday" 
                labels={weekdayLabels} 
                values={weekdayValues}
                className="h-80"
              />
            );
          })()}
        </CardContent>
      </Card>

      {/* Response Sequence Chart */}
      <Card className="shadow-sm border border-border/50">
        <CardContent className="p-6">
          {(() => {
            if (loadingSequence) {
              return <div className="h-80 flex items-center justify-center">Loading sequence data...</div>;
            }

            if (!responsesBySequence || responsesBySequence.length === 0) {
              return <div className="h-80 flex items-center justify-center text-muted-foreground">No sequence data available</div>;
            }

            // Convert sequence data to chart format
            const sequenceLabels = responsesBySequence.map(item => `${item.sequence}${getOrdinalSuffix(item.sequence)}`);
            const totalCounts = responsesBySequence.map(item => item.total_count);
            const positiveCounts = responsesBySequence.map(item => item.positive_count);

            // Calculate percentages for display
            const totalResponses = totalCounts.reduce((sum, count) => sum + count, 0);
            const totalPositiveResponses = positiveCounts.reduce((sum, count) => sum + count, 0);

            const totalPercentages = totalCounts.map(count => 
              totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : '0.0'
            );
            const positivePercentages = positiveCounts.map(count => 
              totalPositiveResponses > 0 ? ((count / totalPositiveResponses) * 100).toFixed(1) : '0.0'
            );

            return (
              <BarMulti
                title="Responses by Sequence"
                labels={sequenceLabels}
                datasets={[
                  {
                    label: 'Total Responses',
                    data: totalCounts,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                  },
                  {
                    label: 'Positive Responses',
                    data: positiveCounts,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                  }
                ]}
                className="h-80"
              />
            );
          })()}
        </CardContent>
      </Card>

      {/* Response Sequence Percentages */}
      <Card className="shadow-sm border border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Response Sequence Analysis</h3>
            {(() => {
              if (loadingSequence) {
                return <div>Loading sequence analysis...</div>;
              }

              if (!responsesBySequence || responsesBySequence.length === 0) {
                return <div className="text-muted-foreground">No sequence data available</div>;
              }

              const totalResponses = responsesBySequence.reduce((sum, item) => sum + item.total_count, 0);
              const totalPositiveResponses = responsesBySequence.reduce((sum, item) => sum + item.positive_count, 0);

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Response Distribution by Sequence</h4>
                    <div className="space-y-2">
                      {responsesBySequence.map(item => {
                        const percentage = totalResponses > 0 ? ((item.total_count / totalResponses) * 100).toFixed(1) : '0.0';
                        return (
                          <div key={item.sequence} className="flex justify-between items-center">
                            <span>{item.sequence}{getOrdinalSuffix(item.sequence)}:</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Positive Response Distribution by Sequence</h4>
                    <div className="space-y-2">
                      {responsesBySequence.map(item => {
                        const percentage = totalPositiveResponses > 0 ? ((item.positive_count / totalPositiveResponses) * 100).toFixed(1) : '0.0';
                        return (
                          <div key={item.sequence} className="flex justify-between items-center">
                            <span>{item.sequence}{getOrdinalSuffix(item.sequence)}:</span>
                            <span className="font-medium text-fa-success">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}