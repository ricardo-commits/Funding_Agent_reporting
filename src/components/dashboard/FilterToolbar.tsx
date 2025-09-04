import { DateRangePicker } from './DateRangePicker';
import { CampaignMultiSelect } from './CampaignMultiSelect';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboard';

export function FilterToolbar() {
  const { filters, resetFilters } = useDashboardStore();

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <DateRangePicker />
          
          <CampaignMultiSelect />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetFilters();
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}