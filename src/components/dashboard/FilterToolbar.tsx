import { DateRangePicker } from './DateRangePicker';
import { ResponseDateRangePicker } from './ResponseDateRangePicker';
import { CampaignMultiSelect } from './CampaignMultiSelect';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboard';
import { useActualDateRange } from '../../hooks/useDashboardData';

export function FilterToolbar() {
  const { filters, resetFilters, setAllTime } = useDashboardStore();
  const { data: actualDateRange } = useActualDateRange();

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1">
          {/* <DateRangePicker /> */}
          <div className="w-full sm:w-auto">
            <ResponseDateRangePicker />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllTime(actualDateRange || undefined)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            All Time
          </Button>
          <div className="w-full sm:w-auto">
            <CampaignMultiSelect />
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetFilters();
          }}
          className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}