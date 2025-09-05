import { useState, useMemo } from 'react';
import { useEmailResponses, useEmailWeekday } from '../hooks/useDashboardData';
import { useTableData } from '../hooks/useTableData';
import { FilterToolbar } from '../components/dashboard/FilterToolbar';
import { TablePagination } from '../components/dashboard/TablePagination';
import { SortableHeader } from '../components/dashboard/SortableHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ResponseLabelPieChart } from '../components/charts/ResponseLabelPieChart';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Responses() {
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  
  const { data: responses, isLoading } = useEmailResponses();
  const { data: weekdayData } = useEmailWeekday();

  // Filter responses by selected label
  const filteredResponses = useMemo(() => {
    if (!selectedLabel || !responses) return responses;
    return responses.filter(response => response.response_label === selectedLabel);
  }, [responses, selectedLabel]);

  const {
    currentData: paginatedResponses,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    sortConfig,
    handleSort,
    totalFilteredItems
  } = useTableData({
    data: filteredResponses,
    itemsPerPage: 20,
    searchFields: []
  });

  const formatDate = (response: any) => {
    // Prioritize received_date_iso_clay for consistency with filters
    if (response.received_date_iso_clay) {
      const date = new Date(response.received_date_iso_clay);
      return date.toLocaleDateString();
    }
    
    // Use webhook_received_date and webhook_time_of_day if available
    if (response.webhook_received_date && response.webhook_time_of_day) {
      const date = new Date(response.webhook_received_date);
      const time = response.webhook_time_of_day;
      return `${date.toLocaleDateString()} at ${time}`;
    }
    
    // Fallback to received_at or created_at
    const dateString = response.received_at || response.created_at;
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getLabelVariant = (label?: string) => {
    if (label === 'interested') return 'default';
    if (label === 'info_requested') return 'secondary';
    if (label === 'not_interested') return 'destructive';
    return 'outline';
  };

  // Prepare label distribution data
  const labelCounts: { [key: string]: number } = {};
  responses?.forEach(response => {
    const label = response.response_label || 'unknown';
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  const labelData = Object.entries(labelCounts).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
      {/* Filter Toolbar */}
      <FilterToolbar />

      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Email Response Analytics</h2>
      </div>

      {/* Response Label Distribution Pie Chart */}
      <Card className="shadow-sm border border-border/50">
        <CardContent className="p-6">
          {labelData.length > 0 ? (
            <ResponseLabelPieChart 
              labelData={labelData.sort((a, b) => b.value - a.value)}
              className="h-80"
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No response label data available</p>
              <p className="text-sm mt-2">Response labels will appear here once data is loaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Label Filters */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Filter by Response Label</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLabel === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel(null)}
              className="text-xs sm:text-sm"
            >
              All Responses
            </Button>
            <Button
              variant={selectedLabel === 'Interested' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Interested')}
              className="text-xs sm:text-sm"
            >
              Interested
            </Button>
            <Button
              variant={selectedLabel === 'Referral' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Referral')}
              className="text-xs sm:text-sm"
            >
              Referral
            </Button>
            <Button
              variant={selectedLabel === 'Not Interested' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Not Interested')}
              className="text-xs sm:text-sm"
            >
              Not Interested
            </Button>
            <Button
              variant={selectedLabel === 'Out of office' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Out of office')}
              className="text-xs sm:text-sm"
            >
              Out of Office
            </Button>
            <Button
              variant={selectedLabel === 'Wrong person' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Wrong person')}
              className="text-xs sm:text-sm"
            >
              Wrong Person
            </Button>
            <Button
              variant={selectedLabel === 'Do not contact' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Do not contact')}
              className="text-xs sm:text-sm"
            >
              Do Not Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Responses Table */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              {selectedLabel ? `${selectedLabel} Responses` : 'All Email Responses'}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({totalFilteredItems} responses)
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading responses...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 sm:py-4 px-2 sm:px-4">
                        <SortableHeader
                          label="Date"
                          sortKey="received_at"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4">
                        <SortableHeader
                          label="Label"
                          sortKey="response_label"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                        <SortableHeader
                          label="Company"
                          sortKey="leads.company_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                        <SortableHeader
                          label="Contact"
                          sortKey="leads.full_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                        <SortableHeader
                          label="Campaign"
                          sortKey="campaigns.campaign_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4">
                        <SortableHeader
                          label="Response Preview"
                          sortKey="response_text"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedResponses?.map((response) => (
                      <tr
                        key={response.id}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground">
                          {formatDate(response)}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <Badge variant={getLabelVariant(response.response_label)} className="text-xs">
                            {response.response_label || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-foreground hidden sm:table-cell">
                          <div className="truncate max-w-[120px]">
                            {response.leads?.company_name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-foreground hidden md:table-cell">
                          <div className="truncate max-w-[100px]">
                            {response.leads?.full_name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                          <div className="truncate max-w-[150px]">
                            {response.campaigns?.campaign_name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground">
                          <div className="truncate max-w-[200px] sm:max-w-xs">
                            {response.response_text?.substring(0, 30) || 'No preview'}
                            {response.response_text && response.response_text.length > 30 && '...'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {paginatedResponses?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {selectedLabel ? `No ${selectedLabel} responses available.` : 'No email responses available.'}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalFilteredItems}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={goToPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Response Details Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Response Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Company</label>
                <div className="font-medium text-foreground">
                  {selectedResponse?.leads?.company_name || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Contact</label>
                <div className="font-medium text-foreground">
                  {selectedResponse?.leads?.full_name || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <div className="text-sm text-muted-foreground">
                  {selectedResponse?.received_at || selectedResponse?.created_at ? new Date(selectedResponse.received_at || selectedResponse.created_at || '').toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Label</label>
                <div>
                  <Badge variant={getLabelVariant(selectedResponse?.response_label)}>
                    {selectedResponse?.response_label || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground">Campaign</label>
              <div className="font-medium text-foreground">
                {selectedResponse?.campaigns?.campaign_name || 'N/A'}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Response Text</label>
              <div className="mt-2 p-4 bg-muted rounded-md text-sm text-foreground max-h-64 overflow-y-auto">
                {selectedResponse?.response_text || 'No response text available'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}