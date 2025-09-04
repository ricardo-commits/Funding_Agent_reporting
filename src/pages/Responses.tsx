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
import { PieChart, buildPieData } from '../charts';

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getLabelVariant = (label?: string) => {
    if (label === 'interested') return 'default';
    if (label === 'info_requested') return 'secondary';
    if (label === 'not_interested') return 'destructive';
    return 'outline';
  };

  // Prepare weekday chart data
  const weekdayChartData = WEEKDAY_LABELS.map((label, index) => {
    const dayData = weekdayData?.find(d => d.weekday === label);
    return {
      name: label,
      value: dayData?.count || 0,
    };
  });

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

  // Transform data for Chart.js with custom legend labels
  const labelChartData = buildPieData(
    labelData.map(item => item.name),
    labelData.map(item => item.value),
    'Response Labels'
  );

  // Customize the legend to show response label numbers
  const customPieOptions = {
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

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-foreground">Email Response Analytics</h2>
      </div>

      {/* Label Distribution Chart */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Response Label Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart
            data={labelChartData}
            height={320}
            ariaLabel="Distribution of email response labels"
            options={customPieOptions}
          />
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
            >
              All Responses
            </Button>
            <Button
              variant={selectedLabel === 'Interested' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Interested')}
            >
              Interested
            </Button>
            <Button
              variant={selectedLabel === 'Referral' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Referral')}
            >
              Referral
            </Button>
            <Button
              variant={selectedLabel === 'Not Interested' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Not Interested')}
            >
              Not Interested
            </Button>
            <Button
              variant={selectedLabel === 'Out of office' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Out of office')}
            >
              Out of Office
            </Button>
            <Button
              variant={selectedLabel === 'Wrong person' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Wrong person')}
            >
              Wrong Person
            </Button>
            <Button
              variant={selectedLabel === 'Do not contact' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Do not contact')}
            >
              Do Not Contact
            </Button>
            <Button
              variant={selectedLabel === 'Other' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLabel('Other')}
            >
              Other
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-4 px-4">
                        <SortableHeader
                          label="Date"
                          sortKey="received_at"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-4 px-4">
                        <SortableHeader
                          label="Label"
                          sortKey="response_label"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-4 px-4">
                        <SortableHeader
                          label="Company"
                          sortKey="leads.company_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-4 px-4">
                        <SortableHeader
                          label="Contact"
                          sortKey="leads.full_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-4 px-4">
                        <SortableHeader
                          label="Campaign"
                          sortKey="campaigns.campaign_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="py-4 px-4">
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
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDate(response.received_at)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={getLabelVariant(response.response_label)}>
                            {response.response_label || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground">
                          {response.leads?.company_name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground">
                          {response.leads?.full_name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {response.campaigns?.campaign_name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground max-w-xs">
                          <div className="truncate">
                            {response.response_text?.substring(0, 50) || 'No preview'}
                            {response.response_text && '...'}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Response Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
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
                  {selectedResponse?.received_at ? new Date(selectedResponse.received_at).toLocaleString() : 'N/A'}
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