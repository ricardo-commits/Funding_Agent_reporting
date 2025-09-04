import { useState } from 'react';
import { useCampaignSplitEmail, useEmailResponses, useSmartleadCampaigns } from '../hooks/useDashboardData';
import { useTableData } from '../hooks/useTableData';
import { FilterToolbar } from '../components/dashboard/FilterToolbar';
import { TablePagination } from '../components/dashboard/TablePagination';
import { TableSearch } from '../components/dashboard/TableSearch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { BarChart, buildBarData } from '../charts';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, MessageSquare, Users, Target, Activity, Mail } from 'lucide-react';
import type { CampaignSplitEmail } from '../types/dashboard';


export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSplitEmail | null>(null);
  
  const { data: campaigns, isLoading } = useCampaignSplitEmail();
  const { data: campaignResponses } = useEmailResponses(selectedCampaign?.campaign_id || undefined);
  const { data: smartleadCampaigns } = useSmartleadCampaigns();

  // Helper function to find Smartlead data for a campaign
  const getSmartleadData = (campaignName: string) => {
    if (!smartleadCampaigns || !campaignName) return null;
    
    // Debug logging removed for production
    
    // Try exact match first
    let match = smartleadCampaigns.find(sc => sc.campaign_name === campaignName);
    if (match) {
      return match;
    }
    
    // Try matching without "Funding Agent: " prefix
    const cleanCampaignName = campaignName.replace('Funding Agent: ', '');
    match = smartleadCampaigns.find(sc => {
      const cleanSmartleadName = sc.campaign_name.replace('Funding Agent: ', '');
      return cleanSmartleadName === cleanCampaignName;
    });
    if (match) {
      return match;
    }
    
    // Try partial matching
    match = smartleadCampaigns.find(sc => {
      const cleanSmartleadName = sc.campaign_name.replace('Funding Agent: ', '').toLowerCase();
      const cleanCampaignNameLower = cleanCampaignName.toLowerCase();
      return cleanSmartleadName.includes(cleanCampaignNameLower) || 
             cleanCampaignNameLower.includes(cleanSmartleadName);
    });
    if (match) {
      return match;
    }
    
    // Try matching key words (e.g., "IT Support" should match "Funding Agent: IT Support")
    const keyWords = cleanCampaignName.split(' ').filter(word => word.length > 2);
    match = smartleadCampaigns.find(sc => {
      const cleanSmartleadName = sc.campaign_name.replace('Funding Agent: ', '').toLowerCase();
      return keyWords.some(keyword => 
        cleanSmartleadName.includes(keyword.toLowerCase())
      );
    });
    
    // Match found or not - logging removed for production
    
    return match || null;
  };

  const {
    currentData: paginatedCampaigns,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    searchQuery,
    sortConfig,
    handleSort,
    handleSearch,
    totalFilteredItems
  } = useTableData({
    data: campaigns,
    itemsPerPage: 12, // Reduced for card layout
    searchFields: ['campaign_name']
  });

  // Get top 5 campaigns for chart (sorted by total replies)
  const chartData = campaigns
    ?.sort((a, b) => (b.total_replies || 0) - (a.total_replies || 0))
    ?.slice(0, 5) || [];

  // Calculate max value for chart scaling
  const maxTotalReplies = Math.max(...(chartData.map(c => c.total_replies) || [0]));
  const suggestedMax = Math.ceil(maxTotalReplies * 1.1); // Add 10% padding

  // Transform data for Chart.js horizontal bar chart with both total and positive replies
  const campaignChartData = buildBarData(
    chartData.map(campaign => campaign.campaign_name),
    [
      { 
        label: 'Total Replies', 
        data: chartData.map(campaign => campaign.total_replies)
      },
      { 
        label: 'Positive Replies', 
        data: chartData.map(campaign => campaign.positive_replies)
      }
    ]
  );

  return (
    <div className="p-6 space-y-8">
      {/* Filter Toolbar */}
      <FilterToolbar />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-foreground">Campaign Performance</h2>
      </div>

      {/* Search and Sort Controls */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Campaign Performance</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Button
                  variant={sortConfig.key === 'campaign_name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('campaign_name')}
                >
                  Name
                </Button>
                <Button
                  variant={sortConfig.key === 'total_replies' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('total_replies')}
                >
                  Total Replies
                </Button>
                <Button
                  variant={sortConfig.key === 'positive_replies' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('positive_replies')}
                >
                  Positive
                </Button>
                <Button
                  variant={sortConfig.key === 'success_rate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('success_rate')}
                >
                  Success Rate
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Campaign Cards Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="text-muted-foreground">Loading campaigns...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedCampaigns?.map((campaign) => {
              const successRate = campaign.success_rate ?? (
                campaign.total_replies > 0 
                  ? Number(((campaign.positive_replies / campaign.total_replies) * 100).toFixed(1))
                  : 0
              );
              
              // Define success rate categories
              const getSuccessRateStyle = (rate: number) => {
                if (rate >= 20) return {
                  bgColor: "bg-green-100",
                  textColor: "text-green-800",
                  borderColor: "border-green-200",
                  variant: "default" as const,
                  label: "Excellent"
                };
                if (rate >= 10) return {
                  bgColor: "bg-blue-100",
                  textColor: "text-blue-800",
                  borderColor: "border-blue-200",
                  variant: "default" as const,
                  label: "Good"
                };
                if (rate >= 5) return {
                  bgColor: "bg-yellow-100",
                  textColor: "text-yellow-800",
                  borderColor: "border-yellow-200",
                  variant: "secondary" as const,
                  label: "Fair"
                };
                return {
                  bgColor: "bg-red-100",
                  textColor: "text-red-800",
                  borderColor: "border-red-200",
                  variant: "destructive" as const,
                  label: "Needs Improvement"
                };
              };
              
              const successStyle = getSuccessRateStyle(successRate);
              
              return (
                <Card 
                  key={campaign.campaign_name}
                  className="shadow-sm border border-border/50 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/30"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground line-clamp-2">
                      {campaign.campaign_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Success Rate Badge */}
                    <div className="flex justify-center">
                      <Badge 
                        variant={successStyle.variant}
                        className={`text-sm px-3 py-1 ${successStyle.bgColor} ${successStyle.textColor} ${successStyle.borderColor}`}
                      >
                        {successRate.toFixed(1)}% Success Rate
                      </Badge>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-center mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-lg font-bold text-blue-700">
                          {campaign.total_replies}
                        </div>
                        <div className="text-xs text-blue-600">Total</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          {campaign.positive_replies || 0}
                        </div>
                        <div className="text-xs text-green-600">Positive</div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="text-lg font-bold text-red-700">
                          {campaign.negative_replies || 0}
                        </div>
                        <div className="text-xs text-red-600">Negative</div>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    <div className="text-center">
                      <div className={`text-xs font-medium ${successStyle.textColor}`}>
                        {successStyle.label}
                      </div>
                    </div>

                    {/* Smartlead Metrics (if available) */}
                    {(() => {
                      const smartleadData = getSmartleadData(campaign.campaign_name);
                      if (smartleadData && smartleadData.sent_count) {
                        return (
                          <div className="space-y-2 pt-2 border-t border-border/50">
                            <div className="text-xs font-medium text-muted-foreground text-center">
                              Smartlead Data
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center justify-center mb-1">
                                  <Target className="h-3 w-3 text-purple-600" />
                                </div>
                                <div className="text-sm font-bold text-purple-700">
                                  {smartleadData.sent_count.toLocaleString()}
                                </div>
                                <div className="text-xs text-purple-600">Sent</div>
                              </div>
                              
                              <div className="text-center p-2 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="flex items-center justify-center mb-1">
                                  <Mail className="h-3 w-3 text-orange-600" />
                                </div>
                                <div className="text-sm font-bold text-orange-700">
                                  {smartleadData.reply_count || 0}
                                </div>
                                <div className="text-xs text-orange-600">Replies</div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">
                                {smartleadData.sent_count > 0 ? 
                                  `${((smartleadData.reply_count || 0) / smartleadData.sent_count * 100).toFixed(1)}% Reply Rate` : 
                                  'No reply rate data'
                                }
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Click to View Details */}
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                        Click to view details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {paginatedCampaigns?.length === 0 && (
            <div className="text-center py-16">
              <div className="text-muted-foreground">
                {searchQuery ? 'No campaigns match your search criteria.' : 'No campaigns available.'}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFilteredItems}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={goToPage}
            />
          </div>
        </>
      )}

      {/* Top Campaigns Chart */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Top 5 Campaigns - Total vs Positive Replies</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Compare total responses with positive outcomes across your best performing campaigns
          </p>
        </CardHeader>
        <CardContent>
          {chartData && chartData.length > 0 ? (
            <BarChart
              key={`campaign-chart-${chartData.length}-${chartData[0]?.campaign_id}`}
              data={campaignChartData}
              horizontal={true}
              height={360}
              ariaLabel="Top 5 campaigns showing total replies vs positive replies"
              options={{
                scales: {
                  x: {
                    suggestedMax: suggestedMax,
                    ticks: {
                      stepSize: Math.ceil(suggestedMax / 8),
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>No campaign data available for chart</p>
                <p className="text-sm mt-2">Campaigns will appear here once data is loaded</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Sheet */}
      <Sheet open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedCampaign?.campaign_name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Success Rate Header */}
            {selectedCampaign && (
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {selectedCampaign.success_rate?.toFixed(1) ?? 
                    (selectedCampaign.total_replies > 0 
                      ? ((selectedCampaign.positive_replies / selectedCampaign.total_replies) * 100).toFixed(1)
                      : '0'
                    )}%
                </div>
                <div className="text-lg font-medium text-muted-foreground">Success Rate</div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {selectedCampaign?.total_replies}
                </div>
                <div className="text-sm text-muted-foreground">Total Replies</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedCampaign?.positive_replies || 0}
                </div>
                <div className="text-sm text-muted-foreground">Positive Replies</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {selectedCampaign?.negative_replies || 0}
                </div>
                <div className="text-sm text-muted-foreground">Negative Replies</div>
              </div>
            </div>

            {/* Smartlead Campaign Data */}
            {(() => {
              const smartleadData = selectedCampaign ? getSmartleadData(selectedCampaign.campaign_name) : null;
              if (smartleadData && smartleadData.sent_count) {
                return (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Smartlead Campaign Data
                    </h4>
                    
                    {/* Smartlead Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-700">
                          {smartleadData.sent_count.toLocaleString()}
                        </div>
                        <div className="text-sm text-purple-600">Emails Sent</div>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-700">
                          {smartleadData.reply_count || 0}
                        </div>
                        <div className="text-sm text-orange-600">Replies</div>
                      </div>
                      
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-700">
                          {smartleadData.bounce_count || 0}
                        </div>
                        <div className="text-sm text-red-600">Bounces</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">
                          {smartleadData.sent_count > 0 ? 
                            `${((smartleadData.reply_count || 0) / smartleadData.sent_count * 100).toFixed(1)}%` : 
                            '0%'
                          }
                        </div>
                        <div className="text-sm text-blue-600">Reply Rate</div>
                      </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Campaign Information</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">External ID:</span>
                            <span className="font-medium">{smartleadData.campaign_external_id || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={smartleadData.is_active ? "default" : "secondary"}>
                              {smartleadData.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">
                              {new Date(smartleadData.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Performance Analysis</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bounce Rate:</span>
                            <span className="font-medium">
                              {smartleadData.sent_count > 0 ? 
                                `${((smartleadData.bounce_count || 0) / smartleadData.sent_count * 100).toFixed(2)}%` : 
                                '0%'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Reach:</span>
                            <span className="font-medium">
                              {smartleadData.total_count ? smartleadData.total_count.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span className="font-medium">
                              {smartleadData.created_at ? 
                                new Date(smartleadData.created_at).toLocaleDateString() : 
                                'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No Smartlead data available for this campaign</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This campaign may not be connected to Smartlead or has no activity data
                  </p>
                </div>
              );
            })()}

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Recent Email Responses (Last 25)</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {campaignResponses?.slice(0, 25).map((response) => (
                  <div key={response.id} className="p-4 border border-border rounded-lg bg-card">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm text-foreground">
                        {response.leads?.company_name} • {response.leads?.full_name}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {response.response_label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(response.created_at || '').toLocaleDateString()} at {new Date(response.created_at || '').toLocaleTimeString()}
                    </div>
                    {response.response_text && (
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {response.response_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}