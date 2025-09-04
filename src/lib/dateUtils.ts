// Date utility functions for handling webhook date columns
// These functions convert the text-based webhook columns to proper date/time objects

/**
 * Convert webhook_received_date (MM-DD-YYYY) to a Date object
 */
export function webhookDateToDate(webhookDate: string): Date | null {
  if (!webhookDate) return null;
  
  try {
    const [month, day, year] = webhookDate.split('-');
    if (month && day && year) {
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  } catch (error) {
    console.error('Error parsing webhook date:', webhookDate, error);
  }
  
  return null;
}

/**
 * Convert webhook_received_date (MM-DD-YYYY) to ISO date string (YYYY-MM-DD)
 */
export function webhookDateToISO(webhookDate: string): string | null {
  if (!webhookDate) return null;
  
  try {
    const [month, day, year] = webhookDate.split('-');
    if (month && day && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  } catch (error) {
    console.error('Error converting webhook date to ISO:', webhookDate, error);
  }
  
  return null;
}

/**
 * Convert webhook_time_of_day to a Date object (assuming format like "9:00 AM")
 */
export function webhookTimeToDate(webhookTime: string, baseDate?: Date): Date | null {
  if (!webhookTime) return null;
  
  try {
    const base = baseDate || new Date();
    const timeString = webhookTime.trim();
    
    // Handle common time formats
    if (timeString.includes('AM') || timeString.includes('PM')) {
      // Format: "9:00 AM" or "2:30 PM"
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      const result = new Date(base);
      result.setHours(hour, parseInt(minutes || '0'), 0, 0);
      return result;
    } else if (timeString.includes(':')) {
      // Format: "14:30" (24-hour)
      const [hours, minutes] = timeString.split(':');
      const result = new Date(base);
      result.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0);
      return result;
    }
  } catch (error) {
    console.error('Error parsing webhook time:', webhookTime, error);
  }
  
  return null;
}

/**
 * Convert webhook_weekday to a number (1-7, Monday=1, Sunday=7)
 */
export function webhookWeekdayToNumber(webhookWeekday: string): number {
  if (!webhookWeekday) return 0;
  
  const weekdayMap: { [key: string]: number } = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 7
  };
  
  return weekdayMap[webhookWeekday] || 0;
}

/**
 * Convert webhook_weekday to a Date object (next occurrence of that weekday)
 */
export function webhookWeekdayToDate(webhookWeekday: string, baseDate?: Date): Date | null {
  if (!webhookWeekday) return null;
  
  const weekdayNumber = webhookWeekdayToNumber(webhookWeekday);
  if (weekdayNumber === 0) return null;
  
  const base = baseDate || new Date();
  const currentWeekday = base.getDay(); // 0-6 (Sunday=0)
  const targetWeekday = weekdayNumber === 7 ? 0 : weekdayNumber; // Convert to 0-6 format
  
  const daysToAdd = (targetWeekday - currentWeekday + 7) % 7;
  const result = new Date(base);
  result.setDate(result.getDate() + daysToAdd);
  
  return result;
}

/**
 * Get a combined date-time from webhook columns
 */
export function getCombinedDateTime(
  webhookDate: string, 
  webhookTime: string
): Date | null {
  const date = webhookDateToDate(webhookDate);
  if (!date) return null;
  
  const time = webhookTimeToDate(webhookTime, date);
  if (!time) return date; // Return just the date if time parsing fails
  
  return time;
}

/**
 * Format webhook date for display
 */
export function formatWebhookDate(webhookDate: string): string {
  const date = webhookDateToDate(webhookDate);
  if (!date) return webhookDate;
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format webhook time for display
 */
export function formatWebhookTime(webhookTime: string): string {
  const time = webhookTimeToDate(webhookTime);
  if (!time) return webhookTime;
  
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
