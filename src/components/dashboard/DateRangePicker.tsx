import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useDashboardStore } from '../../store/dashboard';
import { cn } from '../../lib/utils';

export function DateRangePicker() {
  const { filters, setDateRange } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);

  const dateRange: DateRange | undefined = {
    from: new Date(filters.dateRange.startISO),
    to: new Date(filters.dateRange.endISO),
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({
        startISO: range.from.toISOString().split('T')[0],
        endISO: range.to.toISOString().split('T')[0],
      });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[300px] justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'LLL dd, y')} -{' '}
                {format(dateRange.to, 'LLL dd, y')}
              </>
            ) : (
              format(dateRange.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}