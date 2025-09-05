import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useDashboardStore } from '../../store/dashboard';
import { cn } from '../../lib/utils';

export function DateRangePicker() {
  const { filters, setDateRange } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const date = new Date(filters.dateRange.startISO);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

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

  const handleMonthChange = (month: string) => {
    const monthIndex = parseInt(month);
    const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
    const today = new Date();
    
    // Don't allow navigation to future months
    if (newDate > today) {
      return;
    }
    
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setCurrentMonth(new Date(yearNum, currentMonth.getMonth(), 1));
  };

  // Generate year and month options
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Generate month options (filter out future months for current year)
  const allMonthOptions = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];
  
  const monthOptions = allMonthOptions.filter((month, index) => {
    // For current year, only show months up to current month
    if (currentMonth.getFullYear() === currentYear) {
      return index <= currentMonthIndex;
    }
    // For past years, show all months
    return true;
  });

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
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          initialFocus
          mode="range"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={(date) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            return date > today;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}