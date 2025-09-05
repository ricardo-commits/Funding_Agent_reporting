import { create } from 'zustand';
import { DashboardFilters, DateRange } from '../types/dashboard';

interface DashboardState {
  filters: DashboardFilters;
  setDateRange: (dateRange: DateRange) => void;
  setChannel: (channel: string) => void;
  setCampaign: (campaign?: string[]) => void;
  setResponseDateRange: (dateRange: DateRange) => void;
  resetFilters: () => void;
  setAllTime: (customDateRange?: { earliest: string; latest: string }) => void;
}

// Default to last 7 days for better focus on recent activity
const getDefaultDateRange = (): DateRange => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  return {
    from: startDate,
    to: endDate,
    startISO: startDate.toISOString().split('T')[0],
    endISO: endDate.toISOString().split('T')[0],
  };
};

export const useDashboardStore = create<DashboardState>((set) => ({
  filters: {
    dateRange: getDefaultDateRange(),
    channel: 'email', // Default to email channel
    campaign: undefined,
    responseDateRange: getDefaultDateRange(), // New filter for response dates
  },
  setDateRange: (dateRange) =>
    set((state) => ({
      filters: { ...state.filters, dateRange },
    })),
  setChannel: (channel) =>
    set((state) => ({
      filters: { ...state.filters, channel },
    })),
  setCampaign: (campaign) =>
    set((state) => ({
      filters: { ...state.filters, campaign },
    })),
  setResponseDateRange: (dateRange) =>
    set((state) => ({
      filters: { ...state.filters, responseDateRange: dateRange },
    })),
  setAllTime: (customDateRange) => {
    let allTimeDateRange: DateRange;
    
    if (customDateRange) {
      // Use the actual date range from the database
      allTimeDateRange = {
        from: new Date(customDateRange.earliest),
        to: new Date(customDateRange.latest),
        startISO: customDateRange.earliest,
        endISO: customDateRange.latest,
      };
    } else {
      // Fallback to a reasonable default (last 2 years)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      
      allTimeDateRange = {
        from: startDate,
        to: endDate,
        startISO: startDate.toISOString().split('T')[0],
        endISO: endDate.toISOString().split('T')[0],
      };
    }
    
    set((state) => ({
      filters: { 
        ...state.filters, 
        dateRange: allTimeDateRange,
        responseDateRange: allTimeDateRange 
      },
    }));
  },
  resetFilters: () =>
    set({
      filters: {
        dateRange: getDefaultDateRange(),
        channel: 'email',
        campaign: undefined,
        responseDateRange: getDefaultDateRange(),
      },
    }),
}));