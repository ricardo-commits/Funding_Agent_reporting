import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useCampaignsWithDates } from '../../hooks/useDashboardData';
import { format } from 'date-fns';

export function CampaignsByResponseDate() {
  const { data: campaigns, isLoading, error } = useCampaignsWithDates();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns by Response Date</CardTitle>
          <CardDescription>Loading campaigns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns by Response Date</CardTitle>
          <CardDescription>Error loading campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load campaign data</p>
        </CardContent>
      </Card>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns by Response Date</CardTitle>
          <CardDescription>No campaigns found for the selected date range</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Try adjusting your response date filter</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaigns by Response Date</CardTitle>
        <CardDescription>
          Campaigns filtered by when responses were received
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{campaign.campaign_name}</h3>
                  {campaign.sector && (
                    <Badge variant="secondary" className="text-xs">
                      {campaign.sector}
                    </Badge>
                  )}
                  <Badge variant={campaign.is_active ? "default" : "secondary"}>
                    {campaign.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-4">
                    <span>Total Responses: {campaign.total_responses}</span>
                    <span>Last 7 days: {campaign.responses_last_7_days}</span>
                    <span>Last 30 days: {campaign.responses_last_30_days}</span>
                  </div>
                  
                  {campaign.latest_response_date && (
                    <div className="flex items-center gap-4">
                      <span>
                        Latest Response: {format(new Date(campaign.latest_response_date), 'MMM dd, yyyy')}
                      </span>
                      {campaign.earliest_response_date && (
                        <span>
                          First Response: {format(new Date(campaign.earliest_response_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
