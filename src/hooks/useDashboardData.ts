import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useDashboardStore } from '../store/dashboard';
import { webhookDateToISO } from '../lib/dateUtils';
import { deduplicateResponses } from '../lib/utils';
import type {
  ChannelTotals,
  ChannelPositive,
  ResponsesByWeekday,
  DailyCounts,
  CampaignSplit,
  Response,
  Lead,
  Campaign,
  EmailTotals,
  EmailPositive,
  EmailWeekday,
  EmailDaily,
  CampaignSplitEmail,
  EmailResponse,
  EmailLead,
  EmailsSent,
  CampaignWithDates,
  CampaignPerformanceDated,
  ChannelEnum
} from '../types/dashboard';

// New hooks for the updated schema

// All responses hooks (not just email)
export const useAllResponsesTotals = () => {
  return useQuery({
    queryKey: ['allResponsesTotals'],
    queryFn: async (): Promise<ChannelTotals[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('channel');
        
        if (error) {
          console.error('All responses totals error:', error);
          throw error;
        }

        // Group by channel and count responses
        const channelMap = new Map<string, number>();
        (data || []).forEach(response => {
          const channel = response.channel;
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        });

        return Array.from(channelMap.entries()).map(([channel, count]) => ({
          channel: channel as ChannelEnum,
          total_responses: count
        }));
      } catch (error) {
        console.error('All responses totals error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllResponsesPositive = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['allResponsesPositive', filters.campaign],
    queryFn: async (): Promise<ChannelPositive[]> => {
      try {
        let query = supabase
          .from('responses')
          .select(`
            channel,
            response_label,
            campaigns(campaign_name)
          `);

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }

        const { data, error } = await query;

        if (error) {
          console.error('All responses positive error:', error);
          throw error;
        }

        // Group by channel and calculate positive rates
        const channelMap = new Map<string, { total: number; positive: number }>();
        (data || []).forEach(response => {
          const channel = response.channel;
          const current = channelMap.get(channel) || { total: 0, positive: 0 };
          current.total++;
          if (['Interested', 'Referral'].includes(response.response_label || '')) {
            current.positive++;
          }
          channelMap.set(channel, current);
        });

        return Array.from(channelMap.entries()).map(([channel, counts]) => ({
          channel: channel as ChannelEnum,
          positive_count: counts.positive,
          total_count: counts.total,
          positive_pct: counts.total > 0 ? (counts.positive / counts.total) * 100 : 0
        }));
      } catch (error) {
        console.error('All responses positive error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllResponsesDaily = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['allResponsesDaily', filters.dateRange, filters.campaign],
    queryFn: async (): Promise<DailyCounts[]> => {
      try {
        let query = supabase
          .from('responses')
          .select(`
            received_date_iso_clay,
            channel,
            campaigns(campaign_name)
          `);

        // Add date range filter if provided
        if (filters.dateRange) {
          query = query.gte('received_date_iso_clay', filters.dateRange.startISO)
                       .lte('received_date_iso_clay', filters.dateRange.endISO);
        }

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }

        const { data, error } = await query;

        if (error) {
          console.error('All responses daily error:', error);
          throw error;
        }

        // Group by date and channel
        const dateChannelMap = new Map<string, Map<string, number>>();
        (data || []).forEach(response => {
          const date = response.received_date_iso_clay;
          const channel = response.channel;
          
          if (!dateChannelMap.has(date)) {
            dateChannelMap.set(date, new Map());
          }
          
          const channelMap = dateChannelMap.get(date)!;
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        });

        // Convert to array format
        const result: DailyCounts[] = [];
        dateChannelMap.forEach((channelMap, date) => {
          channelMap.forEach((count, channel) => {
            result.push({
              received_date: date,
              channel: channel as ChannelEnum,
              n: count
            });
          });
        });

        return result.sort((a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime());
      } catch (error) {
        console.error('All responses daily error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllResponsesWeekday = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['allResponsesWeekday', filters.campaign],
    queryFn: async (): Promise<ResponsesByWeekday[]> => {
      try {
        let query = supabase
          .from('responses')
          .select(`
            received_date_iso_clay,
            channel,
            campaigns(campaign_name)
          `);

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }

        const { data, error } = await query;

        if (error) {
          console.error('All responses weekday error:', error);
          throw error;
        }

        // Group by weekday and channel
        const weekdayChannelMap = new Map<number, Map<string, number>>();
        (data || []).forEach(response => {
          const date = new Date(response.received_date_iso_clay);
          const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const channel = response.channel;
          
          if (!weekdayChannelMap.has(weekday)) {
            weekdayChannelMap.set(weekday, new Map());
          }
          
          const channelMap = weekdayChannelMap.get(weekday)!;
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        });

        // Convert to array format
        const result: ResponsesByWeekday[] = [];
        weekdayChannelMap.forEach((channelMap, weekday) => {
          channelMap.forEach((count, channel) => {
            result.push({
              received_weekday: weekday,
              channel: channel as ChannelEnum,
              n_leads: count
            });
          });
        });

        return result.sort((a, b) => a.received_weekday - b.received_weekday);
      } catch (error) {
        console.error('All responses weekday error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllResponses = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['allResponses', filters.dateRange, filters.responseDateRange, filters.campaign],
    queryFn: async (): Promise<Response[]> => {
      try {
        let query = supabase
          .from('responses')
          .select(`
            *,
            leads(company_name, full_name, email),
            campaigns(campaign_name)
          `)
          .order('id', { ascending: false });

        // Add response date range filter if provided
        if (filters.responseDateRange) {
          query = query.gte('received_date_iso_clay', filters.responseDateRange.startISO)
                       .lte('received_date_iso_clay', filters.responseDateRange.endISO);
        }

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }

        const { data, error } = await query;

        if (error) {
          console.error('All responses error:', error);
          throw error;
        }

        return deduplicateResponses(data || []);
      } catch (error) {
        console.error('All responses error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Channel totals calculated from responses table
export const useChannelTotals = () => {
  return useQuery({
    queryKey: ['channelTotals'],
    queryFn: async (): Promise<ChannelTotals[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('channel');
        
        if (error) {
          console.error('Channel totals error:', error);
          throw error;
        }

        // Group by channel and count responses
        const channelMap = new Map<string, number>();
        (data || []).forEach(response => {
          const channel = response.channel;
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        });

        return Array.from(channelMap.entries()).map(([channel, total_responses]) => ({
          channel: channel as ChannelEnum,
          total_responses
        }));
      } catch (error) {
        console.error('Channel totals error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Channel positive percentages calculated from responses table
export const useChannelPositive = () => {
  return useQuery({
    queryKey: ['channelPositive'],
    queryFn: async (): Promise<ChannelPositive[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('channel, response_label');
        
        if (error) {
          console.error('Channel positive error:', error);
          throw error;
        }

        // Group by channel and calculate positive percentages
        const channelMap = new Map<string, { positive: number; total: number }>();
        
        (data || []).forEach(response => {
          const channel = response.channel;
          const isPositive = ['Interested', 'Referral'].includes(response.response_label || '');
          
          if (!channelMap.has(channel)) {
            channelMap.set(channel, { positive: 0, total: 0 });
          }
          
          const channelData = channelMap.get(channel)!;
          channelData.total++;
          if (isPositive) {
            channelData.positive++;
          }
        });

        return Array.from(channelMap.entries()).map(([channel, data]) => ({
          channel: channel as ChannelEnum,
          positive_count: data.positive,
          total_count: data.total,
          positive_pct: data.total > 0 ? (data.positive / data.total) * 100 : 0
        }));
      } catch (error) {
        console.error('Channel positive error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Responses by weekday calculated from responses table
export const useResponsesByWeekday = () => {
  return useQuery({
    queryKey: ['responsesByWeekday'],
    queryFn: async (): Promise<ResponsesByWeekday[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('channel, received_date_iso_clay');
        
        if (error) {
          console.error('Responses by weekday error:', error);
          throw error;
        }

        // Group by channel and weekday
        const channelWeekdayMap = new Map<string, Map<number, number>>();
        
        (data || []).forEach(response => {
          if (response.received_date_iso_clay) {
            const channel = response.channel;
            const date = new Date(response.received_date_iso_clay);
            const weekday = date.getDay(); // 0-6 (Sunday-Saturday)
            const weekdayIndex = weekday === 0 ? 7 : weekday; // Convert to 1-7 (Monday-Sunday)
            
            if (!channelWeekdayMap.has(channel)) {
              channelWeekdayMap.set(channel, new Map());
            }
            
            const weekdayMap = channelWeekdayMap.get(channel)!;
            weekdayMap.set(weekdayIndex, (weekdayMap.get(weekdayIndex) || 0) + 1);
          }
        });

        // Convert to expected format
        const result: ResponsesByWeekday[] = [];
        channelWeekdayMap.forEach((weekdayMap, channel) => {
          weekdayMap.forEach((count, weekday) => {
            result.push({
              channel: channel as ChannelEnum,
              received_weekday: weekday,
              n_leads: count
            });
          });
        });

        return result.sort((a, b) => a.received_weekday - b.received_weekday);
      } catch (error) {
        console.error('Responses by weekday error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Daily counts calculated from responses table
export const useDailyCounts = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['dailyCounts', filters.dateRange],
    queryFn: async (): Promise<DailyCounts[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('channel, received_date_iso_clay')
          .gte('received_date_iso_clay', filters.dateRange.startISO)
          .lte('received_date_iso_clay', filters.dateRange.endISO);
        
        if (error) {
          console.error('Daily counts error:', error);
          throw error;
        }

        // Group by date and channel
        const dateChannelMap = new Map<string, Map<string, number>>();
        
        (data || []).forEach(response => {
          if (response.received_date_iso_clay) {
            const dateStr = response.received_date_iso_clay.split('T')[0]; // Get just the date part
            const channel = response.channel;
            
            if (!dateChannelMap.has(dateStr)) {
              dateChannelMap.set(dateStr, new Map());
            }
            
            const channelMap = dateChannelMap.get(dateStr)!;
            channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
          }
        });

        // Convert to expected format
        const result: DailyCounts[] = [];
        dateChannelMap.forEach((channelMap, date) => {
          channelMap.forEach((count, channel) => {
            result.push({
              received_date: date,
              channel: channel as ChannelEnum,
              n: count
            });
          });
        });

        return result.sort((a, b) => a.received_date.localeCompare(b.received_date));
      } catch (error) {
        console.error('Daily counts error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Campaign split calculated from responses table
export const useCampaignSplit = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['campaignSplit', filters.campaign],
    queryFn: async (): Promise<CampaignSplit[]> => {
      try {
        let query = supabase
          .from('responses')
          .select(`
            campaign_id,
            campaigns!inner(campaign_name),
            response_label
          `)
          .order('campaign_id');

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Campaign split error:', error);
          throw error;
        }

        // Group by campaign and calculate metrics
        const campaignMap = new Map<string, CampaignSplit>();
        
        (data || []).forEach(response => {
          const campaignId = response.campaign_id;
          const campaignName = (response.campaigns as any)?.campaign_name || 'Unknown';
          const responseLabel = response.response_label;
          
          if (!campaignMap.has(campaignId)) {
            campaignMap.set(campaignId, {
              campaign_name: campaignName,
              total_replies: 0,
              interested: 0,
              info_requested: 0
            });
          }
          
          const campaign = campaignMap.get(campaignId)!;
          campaign.total_replies++;
          
          // Categorize responses
          if (responseLabel === 'Interested') {
            campaign.interested++;
          } else if (responseLabel === 'Referral') {
            campaign.info_requested++;
          }
        });

        // Convert to array and sort by total replies
        return Array.from(campaignMap.values())
          .sort((a, b) => b.total_replies - a.total_replies);
      } catch (error) {
        console.error('Campaign split error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// New hook for campaigns with date filtering capabilities
export const useCampaignsWithDates = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['campaignsWithDates', filters.responseDateRange, filters.campaign],
    queryFn: async (): Promise<CampaignWithDates[]> => {
      try {
        // Query responses table directly instead of using non-existent view
        let query = supabase
          .from('responses')
          .select(`
            campaign_id,
            campaigns!inner(campaign_name),
            received_date_iso_clay
          `);

        // Add response date range filter if provided
        if (filters.responseDateRange) {
          query = query.gte('received_date_iso_clay', filters.responseDateRange.startISO)
                       .lte('received_date_iso_clay', filters.responseDateRange.endISO);
        }

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          // filters.campaign contains campaign names, not IDs
          // We need to filter by campaign names through the join
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Campaigns with dates error:', error);
          return [];
        }

        // Group by campaign and calculate metrics
        // First, group by campaign ID to collect all responses
        const campaignIdMap = new Map<string, { campaignName: string; responses: any[] }>();
        
        (data || []).forEach(response => {
          const campaignId = response.campaign_id;
          const campaignName = (response.campaigns as any)?.campaign_name || 'Unknown';
          
          if (!campaignIdMap.has(campaignId)) {
            campaignIdMap.set(campaignId, {
              campaignName,
              responses: []
            });
          }
          
          campaignIdMap.get(campaignId)!.responses.push(response);
        });

        // Now group by base campaign name (removing "(catch_all)" suffix)
        const campaignMap = new Map<string, CampaignWithDates>();
        
        campaignIdMap.forEach(({ campaignName, responses }, campaignId) => {
          // Extract base campaign name by removing "(catch_all)" and "(copy)" suffixes
          const baseCampaignName = campaignName.replace(/\s*\((catch_all|copy)\)\s*(\(copy\)\s*)?$/i, '').trim();
          
          if (!campaignMap.has(baseCampaignName)) {
            campaignMap.set(baseCampaignName, {
              id: campaignId, // Use the first campaign ID as the primary one
              campaign_name: baseCampaignName,
              total_responses: 0,
              latest_response_date: '',
              earliest_response_date: '',
              is_active: true, // Default value
              created_at: new Date().toISOString(), // Default value
              responses_last_7_days: 0, // Will be calculated below
              responses_last_30_days: 0 // Will be calculated below
            });
          }
          
          const campaign = campaignMap.get(baseCampaignName)!;
          
          // Process all responses for this campaign
          responses.forEach(response => {
            const responseDate = response.received_date_iso_clay;
            campaign.total_responses++;
            
            if (!campaign.latest_response_date || responseDate > campaign.latest_response_date) {
              campaign.latest_response_date = responseDate;
            }
            if (!campaign.earliest_response_date || responseDate < campaign.earliest_response_date) {
              campaign.earliest_response_date = responseDate;
            }
          });
        });

        // Calculate 7 and 30 day responses for each campaign
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        campaignMap.forEach(campaign => {
          // Count responses in last 7 and 30 days for this base campaign name
          const recentResponses = (data || []).filter(response => {
            const responseCampaignName = (response.campaigns as any)?.campaign_name || 'Unknown';
            const baseResponseCampaignName = responseCampaignName.replace(/\s*\((catch_all|copy)\)\s*(\(copy\)\s*)?$/i, '').trim();
            return baseResponseCampaignName === campaign.campaign_name && response.received_date_iso_clay;
          });
          
          campaign.responses_last_7_days = recentResponses.filter(response => 
            new Date(response.received_date_iso_clay) >= sevenDaysAgo
          ).length;
          
          campaign.responses_last_30_days = recentResponses.filter(response => 
            new Date(response.received_date_iso_clay) >= thirtyDaysAgo
          ).length;
        });

        // Convert to array and sort by total responses
        return Array.from(campaignMap.values())
          .sort((a, b) => b.total_responses - a.total_responses);
          
      } catch (error) {
        console.error('Campaigns with dates error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// New hook for campaign performance with date filtering
export const useCampaignPerformanceDated = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['campaignPerformanceDated', filters.responseDateRange, filters.campaign],
    queryFn: async (): Promise<CampaignPerformanceDated[]> => {
      try {
        // Query responses table directly instead of using non-existent view
        let query = supabase
          .from('responses')
          .select(`
            campaign_id,
            campaigns!inner(campaign_name),
            response_label,
            received_date_iso_clay
          `);

        // Add response date range filter if provided
        if (filters.responseDateRange) {
          query = query.gte('received_date_iso_clay', filters.responseDateRange.startISO)
                       .lte('received_date_iso_clay', filters.responseDateRange.endISO);
        }

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          // filters.campaign contains campaign names, not IDs
          // We need to filter by campaign names through the join
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Campaign performance dated error:', error);
          return [];
        }

        // Group by campaign and calculate metrics
        const campaignMap = new Map<string, CampaignPerformanceDated>();
        
        (data || []).forEach(response => {
          const campaignId = response.campaign_id;
          const campaignName = (response.campaigns as any)?.campaign_name || 'Unknown';
          const responseLabel = response.response_label;
          const responseDate = response.received_date_iso_clay;
          
          if (!campaignMap.has(campaignId)) {
            campaignMap.set(campaignId, {
              campaign_name: campaignName,
              total_responses: 0,
              latest_response_date: responseDate,
              earliest_response_date: responseDate,
              is_active: true, // Default value
              responses_last_7_days: 0, // Will be calculated below
              responses_last_30_days: 0, // Will be calculated below
              interested: 0,
              referral: 0,
              do_not_contact: 0,
              not_interested: 0,
              out_of_office: 0,
              wrong_person: 0,
              positive_response_rate: 0 // Will be calculated below
            });
          }
          
          const campaign = campaignMap.get(campaignId)!;
          campaign.total_responses++;
          
          // Categorize responses by specific labels
          if (responseLabel === 'Interested') {
            campaign.interested++;
          } else if (responseLabel === 'Referral') {
            campaign.referral++;
          } else if (responseLabel === 'Do not contact') {
            campaign.do_not_contact++;
          } else if (responseLabel === 'Not Interested') {
            campaign.not_interested++;
          } else if (responseLabel === 'Out of office') {
            campaign.out_of_office++;
          } else if (responseLabel === 'Wrong person') {
            campaign.wrong_person++;
          }
          
          if (responseDate > campaign.latest_response_date) {
            campaign.latest_response_date = responseDate;
          }
          if (responseDate < campaign.earliest_response_date) {
            campaign.earliest_response_date = responseDate;
          }
        });

        // Calculate 7 and 30 day responses and positive response rate for each campaign
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        campaignMap.forEach(campaign => {
          // Count responses in last 7 and 30 days
          const recentResponses = (data || []).filter(response => 
            response.campaign_id === campaign.campaign_name && 
            response.received_date_iso_clay
          );
          
          campaign.responses_last_7_days = recentResponses.filter(response => 
            new Date(response.received_date_iso_clay) >= sevenDaysAgo
          ).length;
          
          campaign.responses_last_30_days = recentResponses.filter(response => 
            new Date(response.received_date_iso_clay) >= thirtyDaysAgo
          ).length;
          
          // Calculate positive response rate
          const positiveCount = campaign.interested + campaign.referral;
          campaign.positive_response_rate = campaign.total_responses > 0 ? 
            (positiveCount / campaign.total_responses) * 100 : 0;
        });

        // Convert to array and sort by total responses
        return Array.from(campaignMap.values())
          .sort((a, b) => b.total_responses - a.total_responses);
          
      } catch (error) {
        console.error('Campaign performance dated error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Responses with lead and campaign data
export const useResponses = (campaignId?: string) => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['responses', filters.dateRange, campaignId],
    queryFn: async (): Promise<Response[]> => {
      let query = supabase
        .from('responses')
        .select(`
          *,
          leads(company_name, full_name),
          campaigns(campaign_name)
        `)
        .order('id', { ascending: false }); // Fallback to id if no timestamp columns exist

      // Add campaign filter if provided
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Responses error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 60 * 1000,
  });
};

// Leads with campaign data
export const useLeads = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['leads', filters.campaign],
    queryFn: async (): Promise<Lead[]> => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          campaigns(campaign_name)
        `)
        .order('updated_at', { ascending: false });

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        const campaignNames = filters.campaign;
        query = query.in('campaigns.campaign_name', campaignNames);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Leads error:', error);
        throw error;
      }
      
      // Transform the data to match our type
      const transformedData = (data || []).map(lead => ({
        ...lead,
        campaigns: Array.isArray(lead.campaigns) ? lead.campaigns[0] || null : lead.campaigns
      }));
      
      return transformedData;
    },
    staleTime: 60 * 1000,
  });
};

// Get all campaigns for dropdown selection
export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, campaign_name, is_active, created_at')
        .eq('is_active', true)
        .order('campaign_name');
      
      if (error) {
        console.error('Campaigns error:', error);
        return [];
      }

      // Combine campaigns with same base name but different "(catch_all)" and "(copy)" suffixes
      const campaignMap = new Map<string, Campaign>();
      
      (data || []).forEach(campaign => {
        // Extract base campaign name by removing "(catch_all)" and "(copy)" suffixes
        const baseCampaignName = campaign.campaign_name.replace(/\s*\((catch_all|copy)\)\s*(\(copy\)\s*)?$/i, '').trim();
        
        // Use the first campaign found as the primary one (keep original ID and other fields)
        if (!campaignMap.has(baseCampaignName)) {
          campaignMap.set(baseCampaignName, {
            ...campaign,
            campaign_name: baseCampaignName
          });
        }
      });

      return Array.from(campaignMap.values()).sort((a, b) => a.campaign_name.localeCompare(b.campaign_name));
    },
    staleTime: 60 * 1000,
  });
};

// Get responses for a specific lead
export const useLeadResponses = (leadId: string) => {
  return useQuery({
    queryKey: ['leadResponses', leadId],
    queryFn: async (): Promise<Response[]> => {
      const { data, error } = await supabase
        .from('responses')
        .select(`
          *,
          campaigns(campaign_name)
        `)
        .eq('lead_id', leadId)
        .order('id', { ascending: false }); // Fallback to id if no timestamp columns exist
      
      if (error) {
        console.error('Lead responses error:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!leadId,
    staleTime: 60 * 1000,
  });
};

// Legacy hooks for backward compatibility (keeping the same interface)

// Email-specific data hooks for the Email Campaigns Dashboard
export const useEmailTotals = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailTotals', filters.campaign],
    queryFn: async (): Promise<EmailTotals[]> => {
                      // Calculate directly from responses table
        let query = supabase
          .from('responses')
          .select(`
            channel,
            campaigns(campaign_name)
          `)
          .eq('channel', 'email');

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Email totals error:', error);
        throw error;
      }
      
      return [{ channel: 'email', total_replies: data?.length || 0 }];
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailPositive = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailPositive', filters.campaign],
    queryFn: async (): Promise<EmailPositive[]> => {
              // Calculate directly from responses table
        let query = supabase
          .from('responses')
          .select(`
            response_label,
            campaigns(campaign_name)
          `)
          .eq('channel', 'email');

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Email positive error:', error);
          throw error;
        }
        
        // Calculate positive and total replies
        const totalReplies = data?.length || 0;
        const positiveReplies = data?.filter(response => 
          ['Interested', 'Referral'].includes(response.response_label || '')
        ).length || 0;
        
        return [{ 
          channel: 'email', 
          positive_replies: positiveReplies, 
          total_replies: totalReplies 
        }];
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailInfoRequested = () => {
  return useQuery({
    queryKey: ['emailInfoRequested'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responses')
        .select('response_label')
        .eq('channel', 'email')
        .eq('response_label', 'Referral');
      
      if (error) {
        console.error('Email info requested error:', error);
        return 0;
      }
      return data?.length || 0;
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailInterested = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailInterested', filters.campaign],
    queryFn: async () => {
      let query = supabase
        .from('responses')
        .select(`
          response_label,
          campaigns(campaign_name)
        `)
        .eq('channel', 'email')
        .eq('response_label', 'Interested');

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        // filters.campaign contains campaign names, not IDs
        // We need to filter by campaign names through the join
        const campaignNames = filters.campaign;
        query = query.in('campaigns.campaign_name', campaignNames);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Email interested error:', error);
        return 0;
      }
      return data?.length || 0;
    },
    staleTime: 60 * 1000,
  });
};

// Hook for total emails sent
export const useEmailsSent = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailsSent', filters.campaign],
    queryFn: async (): Promise<EmailsSent[]> => {
      try {
        // If no campaign filter, use the total emails sent view
        if (!filters.campaign || filters.campaign.length === 0) {
          const { data, error } = await supabase
            .from('v_total_emails_sent')
            .select('total_emails_sent');
          
          if (error) {
            console.error('Total emails sent error:', error);
            throw error;
          }
          
          return data || [{ total_emails_sent: 0 }];
        }

        // If campaign filter is provided, use the emails sent by campaign view
        const { data, error } = await supabase
          .from('v_emails_sent')
          .select('total_emails_sent')
          .in('campaign_name', filters.campaign);
        
        if (error) {
          console.error('Emails sent by campaign error:', error);
          throw error;
        }
        
        // Sum up emails sent across filtered campaigns
        const totalEmailsSent = data?.reduce((sum, campaign) => 
          sum + (campaign.total_emails_sent || 0), 0) || 0;
        
        return [{ total_emails_sent: totalEmailsSent }];
      } catch (error) {
        console.error('Emails sent error:', error);
        // Fallback: Calculate directly from leads table
        let query = supabase
          .from('leads')
          .select(`
            id,
            campaigns(campaign_name)
          `)
          .eq('first_touch_channel', 'email');

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error: fallbackError } = await query;
        
        if (fallbackError) {
          console.error('Fallback emails sent error:', fallbackError);
          return [{ total_emails_sent: 0 }];
        }
        
        return [{ 
          total_emails_sent: data?.length || 0 
        }];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Hook for emails sent by campaign (for detailed breakdown)
export const useEmailsSentByCampaign = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailsSentByCampaign', filters.campaign],
    queryFn: async () => {
      try {
        let query = supabase
          .from('v_emails_sent')
          .select('campaign_name, total_emails_sent, email_leads, linkedin_leads')
          .order('total_emails_sent', { ascending: false });

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          query = query.in('campaign_name', filters.campaign);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Emails sent by campaign error:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Emails sent by campaign error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Hook for emails sent daily (for time-based analysis)
export const useEmailsSentDaily = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailsSentDaily', filters.dateRange, filters.campaign],
    queryFn: async () => {
      try {
        let query = supabase
          .from('v_emails_sent_daily')
          .select('sent_date, campaign_name, emails_sent')
          .order('sent_date', { ascending: false });

        // Add date range filter if provided
        if (filters.dateRange) {
          query = query.gte('sent_date', filters.dateRange.startISO)
                       .lte('sent_date', filters.dateRange.endISO);
        }

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          query = query.in('campaign_name', filters.campaign);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Emails sent daily error:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Emails sent daily error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailWeekday = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailWeekday', filters.campaign],
    queryFn: async (): Promise<EmailWeekday[]> => {
      try {
        // Query responses table directly instead of using non-existent view
        let query = supabase
          .from('responses')
          .select(`
            received_date_iso_clay,
            campaigns(campaign_name)
          `)
          .eq('channel', 'email');

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Email weekday error:', error);
          return [];
        }

        // Group by weekday and count responses
        const weekdayMap = new Map<number, number>();
        
        (data || []).forEach(response => {
          if (response.received_date_iso_clay) {
            const date = new Date(response.received_date_iso_clay);
            const weekday = date.getDay(); // 0-6 (Sunday-Saturday)
            const weekdayIndex = weekday === 0 ? 7 : weekday; // Convert to 1-7 (Monday-Sunday)
            
            weekdayMap.set(weekdayIndex, (weekdayMap.get(weekdayIndex) || 0) + 1);
          }
        });

        // Return data in expected format
        return Array.from({ length: 7 }, (_, i) => {
          const weekdayIndex = i + 1; // 1-7 (Monday-Sunday)
          return {
            weekday: weekdayIndex,
            weekdayIndex: weekdayIndex,
            count: weekdayMap.get(weekdayIndex) || 0,
            weekdayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
          };
        });
      } catch (error) {
        console.error('Email weekday error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailDaily = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailDaily', filters.dateRange, filters.campaign],
    queryFn: async (): Promise<EmailDaily[]> => {
      try {
        // Query responses table directly instead of using non-existent view
        let query = supabase
          .from('responses')
          .select(`
            received_date_iso_clay,
            campaigns(campaign_name)
          `)
          .eq('channel', 'email');

        // Add date range filter if provided
        if (filters.dateRange) {
          query = query.gte('received_date_iso_clay', filters.dateRange.startISO)
                       .lte('received_date_iso_clay', filters.dateRange.endISO);
        }

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Email daily error:', error);
          return [];
        }
        
        // Group by date and count responses
        const dateMap = new Map<string, number>();
        
        (data || []).forEach(response => {
          if (response.received_date_iso_clay) {
            const dateStr = response.received_date_iso_clay.split('T')[0]; // Get just the date part
            dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
          }
        });
        
        // Transform data preserving ISO dates and adding date objects
        const transformedData = Array.from(dateMap.entries())
          .map(([dateStr, count]) => ({ 
            received_date: dateStr, // Keep ISO date string
            isoDate: dateStr, // Explicit ISO field
            dateObject: new Date(dateStr), // Add date object for calculations
            count: count,
            weekday: new Date(dateStr).getDay() // 0-6 (Sunday-Saturday)
          }))
          .sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime());
        
        // Fill in missing days with 0 counts for better chart visualization
        const pastWeekData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const existingData = transformedData.find(item => item.received_date === dateStr);
          pastWeekData.push({
            received_date: dateStr,
            isoDate: dateStr,
            dateObject: new Date(date),
            count: existingData ? existingData.count : 0,
            weekday: date.getDay()
          });
        }
        
        return pastWeekData;
      } catch (error) {
        console.error('Email daily error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useCampaignSplitEmail = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['campaignSplitEmail', filters.campaign, filters.responseDateRange],
    queryFn: async (): Promise<CampaignSplitEmail[]> => {
      try {
        // Query responses table directly instead of using non-existent view
        let query = supabase
          .from('responses')
          .select(`
            campaign_id,
            campaigns!inner(campaign_name),
            response_label
          `)
          .eq('channel', 'email')
          .order('campaign_id');

        // Add campaign filter if provided
        if (filters.campaign && filters.campaign.length > 0) {
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }

        // Add response date range filter if provided
        if (filters.responseDateRange) {
          query = query.gte('received_date_iso_clay', filters.responseDateRange.startISO)
                       .lte('received_date_iso_clay', filters.responseDateRange.endISO);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Campaign split error:', error);
          throw error;
        }

        // Group by campaign and calculate metrics
        // First, group by campaign ID to collect all responses
        const campaignIdMap = new Map<string, { campaignName: string; responses: any[] }>();
        
        (data || []).forEach(response => {
          const campaignId = response.campaign_id;
          const campaignName = (response.campaigns as any)?.campaign_name || 'Unknown';
          
          if (!campaignIdMap.has(campaignId)) {
            campaignIdMap.set(campaignId, {
              campaignName,
              responses: []
            });
          }
          
          campaignIdMap.get(campaignId)!.responses.push(response);
        });

        // Now group by base campaign name (removing "(catch_all)" suffix)
        const campaignMap = new Map<string, CampaignSplitEmail>();
        
        campaignIdMap.forEach(({ campaignName, responses }, campaignId) => {
          // Extract base campaign name by removing "(catch_all)" and "(copy)" suffixes
          const baseCampaignName = campaignName.replace(/\s*\((catch_all|copy)\)\s*(\(copy\)\s*)?$/i, '').trim();
          
          if (!campaignMap.has(baseCampaignName)) {
            campaignMap.set(baseCampaignName, {
              campaign_id: campaignId, // Use the first campaign ID as the primary one
              campaign_name: baseCampaignName,
              total_replies: 0,
              positive_replies: 0,
              negative_replies: 0,
              success_rate: 0
            });
          }
          
          const campaign = campaignMap.get(baseCampaignName)!;
          
          // Process all responses for this campaign
          responses.forEach(response => {
            const responseLabel = response.response_label;
            campaign.total_replies++;
            
            // Categorize responses
            if (['Interested', 'Referral'].includes(responseLabel || '')) {
              campaign.positive_replies++;
            } else if (['Do not contact', 'Not Interested', 'Out of office', 'Wrong person'].includes(responseLabel || '')) {
              campaign.negative_replies++;
            }
          });
        });

        // Calculate success rates and convert to array
        const transformedData = Array.from(campaignMap.values()).map(campaign => ({
          ...campaign,
          success_rate: campaign.total_replies > 0 ? 
            (campaign.positive_replies / campaign.total_replies) * 100 : 0
        }));

        // Sort by total replies descending
        return transformedData.sort((a, b) => b.total_replies - a.total_replies);
        
      } catch (error) {
        console.error('Campaign split error:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailResponses = (campaignId?: string) => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailResponses', filters.dateRange, filters.responseDateRange, campaignId, filters.campaign],
    queryFn: async (): Promise<EmailResponse[]> => {
      try {
        let query = supabase
          .from('responses')
          .select(`
            *,
            leads(company_name, full_name, email),
            campaigns(campaign_name)
          `)
          .eq('channel', 'email')
          .order('id', { ascending: false });

        // Add response date range filter if provided
        if (filters.responseDateRange) {
          query = query.gte('received_date_iso_clay', filters.responseDateRange.startISO)
                       .lte('received_date_iso_clay', filters.responseDateRange.endISO);
        }

        // Add campaign filter if provided
        if (campaignId) {
          // campaignId might be a campaign name, not a UUID
          // Check if it looks like a UUID or a campaign name
          if (campaignId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // It's a UUID, filter by campaign_id
            query = query.eq('campaign_id', campaignId);
          } else {
            // It's a campaign name, filter by campaign name through the join
            query = query.eq('campaigns.campaign_name', campaignId);
          }
        } else if (filters.campaign && filters.campaign.length > 0) {
          // filters.campaign contains campaign names, not IDs
          // We need to filter by campaign names through the join
          // This will filter responses where the joined campaign name matches
          const campaignNames = filters.campaign;
          query = query.in('campaigns.campaign_name', campaignNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Email responses error:', error);
          throw error;
        }
        
        // Transform to expected format and clean campaign names
        const transformedData = data?.map(item => ({
          ...item,
          created_at: item.received_at || new Date().toISOString(), // Use received_at as fallback
          campaigns: item.campaigns ? {
            ...item.campaigns,
            campaign_name: item.campaigns.campaign_name?.replace(/\s*\((catch_all|copy)\)\s*(\(copy\)\s*)?$/i, '').trim() || item.campaigns.campaign_name
          } : item.campaigns
        })) || [];

        return deduplicateResponses(transformedData);
      } catch (error) {
        console.error('Email responses error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailLeads = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailLeads', filters.campaign],
    queryFn: async (): Promise<EmailLead[]> => {
      // First, get all lead IDs that have positive email responses (only the 6 specified labels)
      let positiveResponseQuery = supabase
        .from('responses')
        .select(`
          lead_id,
          campaigns(campaign_name)
        `)
        .eq('channel', 'email')
        .in('response_label', ['Interested', 'Referral']);

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        // filters.campaign contains campaign names, not IDs
        // We need to filter by campaign names through the join
        const campaignNames = filters.campaign;
        positiveResponseQuery = positiveResponseQuery.in('campaigns.campaign_name', campaignNames);
      }
      
      const { data: positiveResponseData, error: positiveResponseError } = await positiveResponseQuery;
      
      if (positiveResponseError) {
        console.error('Positive response query error:', positiveResponseError);
        return [];
      }
      
      if (!positiveResponseData || positiveResponseData.length === 0) {
        return [];
      }
      
      // Get unique lead IDs
      const uniqueLeadIds = [...new Set(positiveResponseData.map(r => r.lead_id))];
      
      // Now get the actual lead data for these IDs
      let leadsQuery = supabase
        .from('leads')
        .select(`
          id,
          company_name,
          full_name,
          campaign_id,
          first_touch_channel,
          updated_at,
          campaigns(campaign_name)
        `)
        .in('id', uniqueLeadIds)
        .eq('first_touch_channel', 'email')
        .order('updated_at', { ascending: false });

      const { data: leadsData, error: leadsError } = await leadsQuery;
      
      if (leadsError) {
        console.error('Email leads error:', leadsError);
        throw leadsError;
      }
      
      // Transform the data to match our type and clean campaign names
      const transformedData = (leadsData || []).map(lead => {
        const campaign = Array.isArray(lead.campaigns) ? lead.campaigns[0] || null : lead.campaigns;
        const cleanedCampaign = campaign ? {
          ...campaign,
          campaign_name: campaign.campaign_name?.replace(/\s*\(catch_all\)\s*$/i, '').trim() || campaign.campaign_name
        } : null;
        
        return {
          ...lead,
          campaigns: cleanedCampaign
        };
      });
      
      return transformedData;
    },
    staleTime: 60 * 1000,
  });
};

export const useLeadEmailResponses = (leadId: string) => {
  return useQuery({
    queryKey: ['leadEmailResponses', leadId],
    queryFn: async (): Promise<EmailResponse[]> => {
      const { data, error } = await supabase
        .from('responses')
        .select(`
          *,
          campaigns(campaign_name)
        `)
        .eq('lead_id', leadId)
        .eq('channel', 'email')
        .order('id', { ascending: false }); // Fallback to id if no timestamp columns exist
      
      if (error) {
        console.error('Lead email responses error:', error);
        throw error;
      }
      
      // Transform to expected format and clean campaign names
      return data?.map(item => ({
        ...item,
        created_at: item.received_at || new Date().toISOString(), // Use received_at as fallback
        campaigns: item.campaigns ? {
          ...item.campaigns,
          campaign_name: item.campaigns.campaign_name?.replace(/\s*\(catch_all\)\s*$/i, '').trim() || item.campaigns.campaign_name
        } : item.campaigns
      })) || [];
    },
    enabled: !!leadId,
    staleTime: 60 * 1000,
  });
};

// Hook to get the actual date range from the database
export const useActualDateRange = () => {
  return useQuery({
    queryKey: ['actualDateRange'],
    queryFn: async (): Promise<{ earliest: string; latest: string } | null> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('received_date_iso_clay')
          .not('received_date_iso_clay', 'is', null)
          .order('received_date_iso_clay', { ascending: true });
        
        if (error) {
          console.error('Actual date range error:', error);
          return null;
        }

        if (!data || data.length === 0) {
          return null;
        }

        const dates = data.map(r => r.received_date_iso_clay).filter(Boolean);
        if (dates.length === 0) {
          return null;
        }

        return {
          earliest: dates[0],
          latest: dates[dates.length - 1]
        };
      } catch (error) {
        console.error('Actual date range error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// All-time hooks for Overview page - these ignore date filters and always fetch all data
export const useAllTimeResponsesTotals = () => {
  return useQuery({
    queryKey: ['allTimeResponsesTotals'],
    queryFn: async (): Promise<ChannelTotals[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('channel');
        
        if (error) {
          console.error('All-time responses totals error:', error);
          throw error;
        }

        // Group by channel and count responses
        const channelMap = new Map<string, number>();
        (data || []).forEach(response => {
          const channel = response.channel;
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        });

        return Array.from(channelMap.entries()).map(([channel, count]) => ({
          channel: channel as ChannelEnum,
          total_responses: count
        }));
      } catch (error) {
        console.error('All-time responses totals error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllTimeResponsesPositive = () => {
  return useQuery({
    queryKey: ['allTimeResponsesPositive'],
    queryFn: async (): Promise<ChannelPositive[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select(`
            channel,
            response_label
          `);

        if (error) {
          console.error('All-time responses positive error:', error);
          throw error;
        }

        // Group by channel and calculate positive rates
        const channelMap = new Map<string, { total: number; positive: number }>();
        (data || []).forEach(response => {
          const channel = response.channel;
          const current = channelMap.get(channel) || { total: 0, positive: 0 };
          current.total++;
          if (['Interested', 'Referral'].includes(response.response_label || '')) {
            current.positive++;
          }
          channelMap.set(channel, current);
        });

        return Array.from(channelMap.entries()).map(([channel, counts]) => ({
          channel: channel as ChannelEnum,
          positive_count: counts.positive,
          total_count: counts.total,
          positive_pct: counts.total > 0 ? (counts.positive / counts.total) * 100 : 0
        }));
      } catch (error) {
        console.error('All-time responses positive error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllTimeResponsesDaily = () => {
  return useQuery({
    queryKey: ['allTimeResponsesDaily'],
    queryFn: async (): Promise<DailyCounts[]> => {
      try {
        // Get today's date in ISO format to filter out future dates
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('responses')
          .select(`
            received_date_iso_clay,
            channel
          `)
          .lte('received_date_iso_clay', today); // Filter out future dates

        if (error) {
          console.error('All-time responses daily error:', error);
          throw error;
        }

        // Group by date and channel
        const dateChannelMap = new Map<string, Map<string, number>>();
        (data || []).forEach(response => {
          const date = response.received_date_iso_clay;
          const channel = response.channel;
          
          if (!dateChannelMap.has(date)) {
            dateChannelMap.set(date, new Map());
          }
          
          const channelMap = dateChannelMap.get(date)!;
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        });

        // Convert to array format
        const result: DailyCounts[] = [];
        dateChannelMap.forEach((channelMap, date) => {
          channelMap.forEach((count, channel) => {
            result.push({
              received_date: date,
              channel: channel as ChannelEnum,
              n: count
            });
          });
        });

        return result.sort((a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime());
      } catch (error) {
        console.error('All-time responses daily error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllTimeResponsesWeekday = () => {
  return useQuery({
    queryKey: ['allTimeResponsesWeekday'],
    queryFn: async (): Promise<ResponsesByWeekday[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select(`
            received_date_iso_clay,
            channel
          `);

        if (error) {
          console.error('All-time responses weekday error:', error);
          throw error;
        }

        // Group by weekday and channel
        const weekdayChannelMap = new Map<number, Map<string, number>>();
        (data || []).forEach(response => {
          const date = new Date(response.received_date_iso_clay);
          const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const channel = response.channel;
          
          if (!weekdayChannelMap.has(weekday)) {
            weekdayChannelMap.set(weekday, new Map());
          }
          
          const channelMap = weekdayChannelMap.get(weekday)!;
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        });

        // Convert to array format
        const result: ResponsesByWeekday[] = [];
        weekdayChannelMap.forEach((channelMap, weekday) => {
          channelMap.forEach((count, channel) => {
            result.push({
              received_weekday: weekday,
              channel: channel as ChannelEnum,
              n_leads: count
            });
          });
        });

        return result.sort((a, b) => a.received_weekday - b.received_weekday);
      } catch (error) {
        console.error('All-time responses weekday error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllTimeResponses = () => {
  return useQuery({
    queryKey: ['allTimeResponses'],
    queryFn: async (): Promise<Response[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select(`
            *,
            leads(company_name, full_name, email),
            campaigns(campaign_name)
          `)
          .order('id', { ascending: false });

        if (error) {
          console.error('All-time responses error:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('All-time responses error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useAllTimeEmailInterested = () => {
  return useQuery({
    queryKey: ['allTimeEmailInterested'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responses')
        .select('response_label')
        .eq('channel', 'email')
        .eq('response_label', 'Interested');
      
      if (error) {
        console.error('All-time email interested error:', error);
        return 0;
      }
      return data?.length || 0;
    },
    staleTime: 60 * 1000,
  });
};

export const useAllTimeEmailsSent = () => {
  return useQuery({
    queryKey: ['allTimeEmailsSent'],
    queryFn: async (): Promise<EmailsSent[]> => {
      try {
        const { data, error } = await supabase
          .from('v_total_emails_sent')
          .select('total_emails_sent');
        
        if (error) {
          console.error('All-time emails sent error:', error);
          throw error;
        }
        
        return data || [{ total_emails_sent: 0 }];
      } catch (error) {
        console.error('All-time emails sent error:', error);
        // Fallback: Calculate directly from leads table
        const { data, error: fallbackError } = await supabase
          .from('leads')
          .select('id')
          .eq('first_touch_channel', 'email');
        
        if (fallbackError) {
          console.error('Fallback all-time emails sent error:', fallbackError);
          return [{ total_emails_sent: 0 }];
        }
        
        return [{ 
          total_emails_sent: data?.length || 0 
        }];
      }
    },
    staleTime: 60 * 1000,
  });
};

// New hooks for response sequence data
export const useAllTimeResponsesBySequence = () => {
  return useQuery({
    queryKey: ['allTimeResponsesBySequence'],
    queryFn: async (): Promise<{ sequence: number; total_count: number; positive_count: number }[]> => {
      try {
        const { data, error } = await supabase
          .from('responses')
          .select(`
            response_sequence,
            response_label
          `)
          .not('response_sequence', 'is', null);

        if (error) {
          console.error('All-time responses by sequence error:', error);
          throw error;
        }

        // Group by sequence and calculate totals and positive counts
        const sequenceMap = new Map<number, { total: number; positive: number }>();
        
        (data || []).forEach(response => {
          const sequence = response.response_sequence;
          const isPositive = ['Interested', 'Referral'].includes(response.response_label || '');
          
          if (!sequenceMap.has(sequence)) {
            sequenceMap.set(sequence, { total: 0, positive: 0 });
          }
          
          const current = sequenceMap.get(sequence)!;
          current.total++;
          if (isPositive) {
            current.positive++;
          }
        });

        // Convert to array and sort by sequence
        return Array.from(sequenceMap.entries())
          .map(([sequence, counts]) => ({
            sequence,
            total_count: counts.total,
            positive_count: counts.positive
          }))
          .sort((a, b) => a.sequence - b.sequence);
      } catch (error) {
        console.error('All-time responses by sequence error:', error);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

// Smartlead Campaign hooks - Commented out
/*
export const useSmartleadCampaigns = () => {
  return useQuery({
    queryKey: ['smartleadCampaigns'],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, campaign_name, is_active, created_at, campaign_external_id, sent_count, bounce_count, total_count, reply_count')
        .order('campaign_name');
      
      if (error) {
        console.error('Smartlead campaigns error:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 60 * 1000,
  });
};

export const useSmartleadMetrics = () => {
  return useQuery({
    queryKey: ['smartleadMetrics'],
    queryFn: async (): Promise<any> => {
      // Calculate metrics directly from the campaigns data
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('id, campaign_name, is_active, sent_count, bounce_count, total_count, reply_count');
      
      if (error) {
        console.error('Smartlead metrics error:', error);
        // Return default values if query fails
        return {
          total_sent: 0,
          total_bounces: 0,
          total_replies: 0,
          total_campaigns: 0,
          active_campaigns: 0,
          average_reply_rate: 0,
          average_bounce_rate: 0
        };
      }
      
      if (!campaigns || campaigns.length === 0) {
        return {
          total_sent: 0,
          total_bounces: 0,
          total_replies: 0,
          total_campaigns: 0,
          active_campaigns: 0,
          average_reply_rate: 0,
          average_bounce_rate: 0
        };
      }

      const activeCampaigns = campaigns.filter(c => c.is_active && c.sent_count);
      const totalSent = activeCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const totalBounces = activeCampaigns.reduce((sum, c) => sum + (c.bounce_count || 0), 0);
      const totalReplies = activeCampaigns.reduce((sum, c) => sum + (c.reply_count || 0), 0);
      const totalCampaigns = campaigns.length;
      const activeCampaignsCount = activeCampaigns.length;

      const averageReplyRate = totalSent > 0 ? (totalReplies / totalSent) * 100 : 0;
      const averageBounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;

      return {
        total_sent: totalSent,
        total_bounces: totalBounces,
        total_replies: totalReplies,
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaignsCount,
        average_reply_rate: averageReplyRate,
        average_bounce_rate: averageBounceRate
      };
    },
    staleTime: 60 * 1000,
  });
};
*/