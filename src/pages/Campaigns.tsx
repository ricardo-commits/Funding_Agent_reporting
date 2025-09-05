import { useState } from 'react';
import { useCampaignSplitEmail, useEmailResponses } from '../hooks/useDashboardData';
import { useTableData } from '../hooks/useTableData';
import { FilterToolbar } from '../components/dashboard/FilterToolbar';
import { TablePagination } from '../components/dashboard/TablePagination';
import { TableSearch } from '../components/dashboard/TableSearch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, MessageSquare, Users, Target, Activity, Mail } from 'lucide-react';
import type { CampaignSplitEmail, EmailResponse } from '../types/dashboard';
import { CampaignsByResponseDate } from '../components/dashboard/CampaignsByResponseDate';
import { CampaignPerformanceChart } from '../components/charts/CampaignPerformanceChart';


export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSplitEmail | null>(null);
  
  const { data: campaigns, isLoading, error } = useCampaignSplitEmail();
  const { data: campaignResponses } = useEmailResponses(selectedCampaign?.campaign_id || undefined);

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

  // Get top 5 campaigns for summary (sorted by total replies)
  const topCampaigns = campaigns
    ?.sort((a, b) => (b.total_replies || 0) - (a.total_replies || 0))
    ?.slice(0, 5) || [];

  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
      {/* Filter Toolbar */}
      <FilterToolbar />

      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Campaign Performance</h2>
      </div>

      {/* Search and Sort Controls */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-foreground">Campaign Performance</CardTitle>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <Button
                  variant={sortConfig.key === 'campaign_name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('campaign_name')}
                  className="text-xs sm:text-sm"
                >
                  Name
                </Button>
                <Button
                  variant={sortConfig.key === 'total_replies' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('total_replies')}
                  className="text-xs sm:text-sm"
                >
                  Total
                </Button>
                <Button
                  variant={sortConfig.key === 'positive_replies' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('positive_replies')}
                  className="text-xs sm:text-sm"
                >
                  Positive
                </Button>
                <Button
                  variant={sortConfig.key === 'success_rate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('success_rate')}
                  className="text-xs sm:text-sm"
                >
                  Rate
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
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-fa-danger mb-4">Error loading campaigns: {error.message}</div>
          <div className="text-sm text-muted-foreground">Please check your database connection and try again.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedCampaigns?.map((campaign) => {
              const successRate = campaign.success_rate ?? (
                campaign.total_replies > 0 
                  ? Number(((campaign.positive_replies / campaign.total_replies) * 100).toFixed(1))
                  : 0
              );
              
              // Define success rate categories
              const getSuccessRateStyle = (rate: number) => {
                if (rate >= 20) return {
                  bgColor: "bg-fa-success/10",
                  textColor: "text-fa-success",
                  borderColor: "border-fa-success/20",
                  variant: "default" as const,
                  label: "Excellent"
                };
                if (rate >= 10) return {
                  bgColor: "bg-primary/10",
                  textColor: "text-primary",
                  borderColor: "border-primary/20",
                  variant: "default" as const,
                  label: "Good"
                };
                if (rate >= 5) return {
                  bgColor: "bg-fa-warning/10",
                  textColor: "text-fa-warning",
                  borderColor: "border-fa-warning/20",
                  variant: "secondary" as const,
                  label: "Fair"
                };
                return {
                  bgColor: "bg-fa-danger/10",
                  textColor: "text-fa-danger",
                  borderColor: "border-fa-danger/20",
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
                      <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-center mb-1">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {campaign.total_replies}
                        </div>
                        <div className="text-xs text-primary/80">Total</div>
                      </div>
                      
                      <div className="text-center p-3 bg-fa-success/10 rounded-lg border border-fa-success/20">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-fa-success" />
                        </div>
                        <div className="text-lg font-bold text-fa-success">
                          {campaign.positive_replies || 0}
                        </div>
                        <div className="text-xs text-fa-success/80">Positive</div>
                      </div>
                      
                      <div className="text-center p-3 bg-fa-danger/10 rounded-lg border border-fa-danger/20">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingDown className="h-4 w-4 text-fa-danger" />
                        </div>
                        <div className="text-lg font-bold text-fa-danger">
                          {campaign.negative_replies || 0}
                        </div>
                        <div className="text-xs text-fa-danger/80">Negative</div>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    <div className="text-center">
                      <div className={`text-xs font-medium ${successStyle.textColor}`}>
                        {successStyle.label}
                      </div>
                    </div>

                    {/* Smartlead Metrics (if available) - Removed */}
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
              <div className="text-sm text-muted-foreground mt-2">
                This could mean: no campaigns exist, no responses exist, or there's a database connection issue.
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



      {/* Top Campaigns Performance Chart */}
      <Card className="shadow-sm border border-border/50">
        <CardContent className="p-2">
          {topCampaigns && topCampaigns.length > 0 ? (
            <CampaignPerformanceChart 
              campaigns={topCampaigns}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground p-6">
              <p>No campaign data available</p>
              <p className="text-sm mt-2">Campaigns will appear here once data is loaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Sheet */}
      <Sheet open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <SheetContent className="w-full sm:max-w-2xl max-h-[100vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base sm:text-lg">{selectedCampaign?.campaign_name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Success Rate Header */}
            {selectedCampaign && (
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {selectedCampaign.success_rate?.toFixed(1) ?? 
                    (selectedCampaign.total_replies > 0 
                      ? ((selectedCampaign.positive_replies / selectedCampaign.total_replies) * 100).toFixed(1)
                      : '0'
                    )}%
                </div>
                <div className="text-base sm:text-lg font-medium text-muted-foreground">Success Rate</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {selectedCampaign?.total_replies}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Replies</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-fa-success/10 rounded-lg border border-fa-success/20">
                <div className="text-xl sm:text-2xl font-bold text-fa-success">
                  {selectedCampaign?.positive_replies || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Positive Replies</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-fa-danger/10 rounded-lg border border-fa-danger/20">
                <div className="text-xl sm:text-2xl font-bold text-fa-danger">
                  {selectedCampaign?.negative_replies || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Negative Replies</div>
              </div>
            </div>

            {/* Smartlead Campaign Data - Removed */}

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
                      {(() => {
                        // Prioritize received_date_iso_clay and time_of_day_iso for consistency with filters
                        if (response.received_date_iso_clay && response.time_of_day_iso) {
                          const date = new Date(response.received_date_iso_clay);
                          return `${date.toLocaleDateString()} at ${response.time_of_day_iso}`;
                        }
                        
                        // Fallback to received_date_iso_clay with toLocaleTimeString
                        if (response.received_date_iso_clay) {
                          const date = new Date(response.received_date_iso_clay);
                          return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
                        }
                        
                        // Try to use webhook fields if available
                        if (response.webhook_received_date && response.webhook_time_of_day) {
                          return `${new Date(response.webhook_received_date).toLocaleDateString()} at ${response.webhook_time_of_day}`;
                        }
                        
                        // Fallback to created_at
                        return `${new Date(response.created_at || '').toLocaleDateString()} at ${new Date(response.created_at || '').toLocaleTimeString()}`;
                      })()}
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