import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCampaigns } from '../../hooks/useDashboardData';
import { useDashboardStore } from '../../store/dashboard';
import { cn } from '../../lib/utils';

interface CampaignMultiSelectProps {
  className?: string;
}

export function CampaignMultiSelect({ className }: CampaignMultiSelectProps) {
  const { filters, setCampaign } = useDashboardStore();
  const { data: campaigns, isLoading } = useCampaigns();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCampaigns = filters.campaign || [];
  
  const handleToggleCampaign = (campaignId: string) => {
    const newSelection = selectedCampaigns.includes(campaignId)
      ? selectedCampaigns.filter(id => id !== campaignId)
      : [...selectedCampaigns, campaignId];
    
    setCampaign(newSelection.length > 0 ? newSelection : undefined);
  };

  const handleRemoveCampaign = (campaignId: string) => {
    const newSelection = selectedCampaigns.filter(id => id !== campaignId);
    setCampaign(newSelection.length > 0 ? newSelection : undefined);
  };

  const handleClearAll = () => {
    setCampaign(undefined);
  };

  const filteredCampaigns = campaigns?.filter(campaign =>
    campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDisplayText = () => {
    if (selectedCampaigns.length === 0) return 'Select campaigns...';
    if (selectedCampaigns.length === 1) {
      const campaign = campaigns?.find(c => c.id === selectedCampaigns[0]);
      return campaign?.campaign_name || 'Selected campaign';
    }
    return `${selectedCampaigns.length} campaigns selected`;
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-80 justify-between"
        disabled={isLoading}
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-border">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Selected campaigns display */}
          {selectedCampaigns.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Selected:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedCampaigns.map(campaignId => {
                  const campaign = campaigns?.find(c => c.id === campaignId);
                  return (
                    <Badge
                      key={campaignId}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span className="truncate max-w-32">
                        {campaign?.campaign_name || 'Unknown'}
                      </span>
                      <button
                        onClick={() => handleRemoveCampaign(campaignId)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Campaign list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCampaigns.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                {searchTerm ? 'No campaigns found' : 'No campaigns available'}
              </div>
            ) : (
              filteredCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className={cn(
                    'flex items-center px-3 py-2 cursor-pointer hover:bg-accent',
                    selectedCampaigns.includes(campaign.id) && 'bg-accent'
                  )}
                  onClick={() => handleToggleCampaign(campaign.id)}
                >
                  <div className="flex items-center justify-center w-4 h-4 mr-3">
                    {selectedCampaigns.includes(campaign.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm">{campaign.campaign_name}</span>
                </div>
              ))
            )}
          </div>

          {/* Footer with count */}
          <div className="p-3 border-t border-border bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {selectedCampaigns.length} of {campaigns?.length || 0} campaigns selected
              </span>
              {selectedCampaigns.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
