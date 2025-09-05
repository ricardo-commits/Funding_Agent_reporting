import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useDashboardStore } from '../../store/dashboard';
import { cn } from '../../lib/utils';

export function ResponseDateRangePicker() {
  const { filters, setResponseDateRange } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);

  const dateRange: DateRange | undefined = {
    from: new Date(filters.responseDateRange.startISO),
    to: new Date(filters.responseDateRange.endISO),
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setResponseDateRange({
        from: range.from,
        to: range.to,
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
            'w-full sm:w-[300px] justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground'
          )}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                Responses: {format(dateRange.from, 'LLL dd, y')} -{' '}
                {format(dateRange.to, 'LLL dd, y')}
              </>
            ) : (
              `Responses: ${format(dateRange.from, 'LLL dd, y')}`
            )
          ) : (
            <span>Filter by response dates</span>
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
