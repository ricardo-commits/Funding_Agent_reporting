import { create } from 'zustand';
import { DashboardFilters, DateRange } from '../types/dashboard';

interface DashboardState {
  filters: DashboardFilters;
  setDateRange: (dateRange: DateRange) => void;
  setChannel: (channel: string) => void;
  setCampaign: (campaign?: string[]) => void;
  resetFilters: () => void;
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
  resetFilters: () =>
    set({
      filters: {
        dateRange: getDefaultDateRange(),
        channel: 'email',
        campaign: undefined,
      },
    }),
}));