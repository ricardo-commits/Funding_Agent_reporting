import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useDashboardStore } from '../store/dashboard';
import { webhookDateToISO } from '../lib/dateUtils';
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
  SmartleadCampaign,
  SmartleadMetrics
} from '../types/dashboard';

// New hooks for the updated schema

// Channel totals from v_channel_totals view
export const useChannelTotals = () => {
  return useQuery({
    queryKey: ['channelTotals'],
    queryFn: async (): Promise<ChannelTotals[]> => {
      const { data, error } = await supabase
        .from('v_channel_totals')
        .select('*');
      
      if (error) {
        console.error('Channel totals error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 60 * 1000,
  });
};

// Channel positive percentages from v_channel_positive view
export const useChannelPositive = () => {
  return useQuery({
    queryKey: ['channelPositive'],
    queryFn: async (): Promise<ChannelPositive[]> => {
      const { data, error } = await supabase
        .from('v_channel_positive')
        .select('*');
      
      if (error) {
        console.error('Channel positive error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 60 * 1000,
  });
};

// Responses by weekday from v_responses_by_weekday view
export const useResponsesByWeekday = () => {
  return useQuery({
    queryKey: ['responsesByWeekday'],
    queryFn: async (): Promise<ResponsesByWeekday[]> => {
      const { data, error } = await supabase
        .from('v_responses_by_weekday')
        .select('*')
        .order('received_weekday');
      
      if (error) {
        console.error('Responses by weekday error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 60 * 1000,
  });
};

// Daily counts from v_daily_counts view
export const useDailyCounts = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['dailyCounts', filters.dateRange],
    queryFn: async (): Promise<DailyCounts[]> => {
      const { data, error } = await supabase
        .from('v_daily_counts')
        .select('*')
        .gte('received_date', filters.dateRange.startISO)
        .lte('received_date', filters.dateRange.endISO)
        .order('received_date');
      
      if (error) {
        console.error('Daily counts error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 60 * 1000,
  });
};

// Campaign split from v_campaign_split view
export const useCampaignSplit = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['campaignSplit', filters.campaign],
    queryFn: async (): Promise<CampaignSplit[]> => {
      let query = supabase
        .from('v_campaign_split')
        .select('*')
        .order('total_replies', { ascending: false });

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        // Filter by campaign IDs from the view
        const campaignIds = filters.campaign;
        query = query.in('campaign_id', campaignIds);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Campaign split error:', error);
        throw error;
      }
      return data || [];
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
        query = query.in('campaign_id', filters.campaign);
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
      return data || [];
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
      // Use the v_channel_totals view for better performance
      let query = supabase
        .from('v_channel_totals')
        .select('*')
        .eq('channel', 'email');

      // Note: The view doesn't support campaign filtering directly
      // If campaign filtering is needed, we'd need to modify the view
      // For now, we'll get the total count for email channel
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Email totals error:', error);
        throw error;
      }
      
      return [{ channel: 'email', total_replies: data?.[0]?.total_responses || 0 }];
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailPositive = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailPositive', filters.campaign],
    queryFn: async (): Promise<EmailPositive[]> => {
      // Use the v_channel_positive view for better performance
      let query = supabase
        .from('v_channel_positive')
        .select('*')
        .eq('channel', 'email');

      // Note: The view doesn't support campaign filtering directly
      // If campaign filtering is needed, we'd need to modify the view
      // For now, we'll get the total count for email channel
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Email positive error:', error);
        throw error;
      }
      
      return [{ 
        channel: 'email', 
        positive_replies: data?.[0]?.positive_count || 0, 
        total_replies: data?.[0]?.total_count || 0 
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
        .select('response_label')
        .eq('channel', 'email')
        .eq('response_label', 'Interested');

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        query = query.in('campaign_id', filters.campaign);
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
    queryKey: ['emailsSentDirect', filters.campaign],
    queryFn: async (): Promise<EmailsSent[]> => {
      // Calculate directly from leads table (supports campaign filtering)
      let query = supabase
        .from('leads')
        .select('id')
        .eq('first_touch_channel', 'email');

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        query = query.in('campaign_id', filters.campaign);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Emails sent error:', error);
        // Fallback: Return a default count based on responses
        const { data: responsesData } = await supabase
          .from('responses')
          .select('id')
          .eq('channel', 'email');
        
        return [{ 
          total_emails_sent: responsesData?.length || 0 // Estimate based on responses
        }];
      }
      
      return [{ 
        total_emails_sent: data?.length || 0 
      }];
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailWeekday = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailWeekday', filters.campaign],
    queryFn: async (): Promise<EmailWeekday[]> => {
      // Use the v_responses_by_weekday view for better performance
      let query = supabase
        .from('v_responses_by_weekday')
        .select('*')
        .eq('channel', 'email')
        .order('received_weekday');

      // Note: The view doesn't support campaign filtering directly
      // If campaign filtering is needed, we'd need to modify the view
      // For now, we'll get the data for email channel
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Email weekday error:', error);
        return [];
      }
      
      // Return raw weekday data with indices for enhanced chart builders
      return (data || [])
        .filter(item => item.received_weekday >= 1 && item.received_weekday <= 7)
        .map(item => ({
          weekday: item.received_weekday, // Keep the raw index (1-7)
          weekdayIndex: item.received_weekday, // Explicit index field
          count: item.n_leads,
          // Keep legacy format for backward compatibility
          weekdayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][item.received_weekday - 1]
        }));
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailDaily = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailDaily', filters.dateRange, filters.campaign],
    queryFn: async (): Promise<EmailDaily[]> => {
      // Use the v_daily_counts view for better performance
      let query = supabase
        .from('v_daily_counts')
        .select('*')
        .eq('channel', 'email');

      // Add date range filter if provided
      if (filters.dateRange) {
        query = query.gte('received_date', filters.dateRange.startISO)
                   .lte('received_date', filters.dateRange.endISO);
      }

      // Note: The view doesn't support campaign filtering directly
      // If campaign filtering is needed, we'd need to modify the view
      // For now, we'll get the data for email channel
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Email daily error:', error);
        return [];
      }
      
      // Transform data preserving ISO dates and adding date objects
      const transformedData = (data || [])
        .filter(item => item.received_date) // Only include items with valid dates
        .map(item => ({ 
          received_date: item.received_date, // Keep ISO date string
          isoDate: item.received_date, // Explicit ISO field
          dateObject: new Date(item.received_date), // Add date object for calculations
          count: parseInt(item.n) || 0,
          weekday: new Date(item.received_date).getDay() // 0-6 (Sunday-Saturday)
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
    },
    staleTime: 60 * 1000,
  });
};

export const useCampaignSplitEmail = () => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['campaignSplitEmail', filters.campaign],
    queryFn: async (): Promise<CampaignSplitEmail[]> => {
      let query = supabase
        .from('v_campaign_split')
        .select('*')
        .order('success_rate', { ascending: false });

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        // Filter by campaign IDs from the view
        const campaignIds = filters.campaign;
        query = query.in('campaign_id', campaignIds);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Campaign split error:', error);
        throw error;
      }
      
      // The view now returns the correct structure with positive_replies, negative_replies, total_replies, success_rate
      // No transformation needed, just ensure all fields are present
      const transformedData = (data || []).map(campaign => ({
        ...campaign,
        // Ensure all required fields are present with defaults
        positive_replies: campaign.positive_replies || 0,
        negative_replies: campaign.negative_replies || 0,
        total_replies: campaign.total_replies || 0,
        success_rate: campaign.success_rate || 0
      }));
      
      return transformedData;
    },
    staleTime: 60 * 1000,
  });
};

export const useEmailResponses = (campaignId?: string) => {
  const filters = useDashboardStore((state) => state.filters);
  
  return useQuery({
    queryKey: ['emailResponses', filters.dateRange, campaignId, filters.campaign],
    queryFn: async (): Promise<EmailResponse[]> => {
      let query = supabase
        .from('responses')
        .select(`
          *,
          leads(company_name, full_name),
          campaigns(campaign_name)
        `)
        .eq('channel', 'email')
        .order('id', { ascending: false }); // Fallback to id if no timestamp columns exist

      // Add campaign filter if provided
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      } else if (filters.campaign && filters.campaign.length > 0) {
        query = query.in('campaign_id', filters.campaign);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Email responses error:', error);
        throw error;
      }
      
      // Transform to expected format
      return data?.map(item => ({
        ...item,
        created_at: item.received_at || new Date().toISOString() // Use received_at as fallback
      })) || [];
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
        .select('lead_id')
        .eq('channel', 'email')
        .in('response_label', ['Interested', 'Referral']);

      // Add campaign filter if provided
      if (filters.campaign && filters.campaign.length > 0) {
        positiveResponseQuery = positiveResponseQuery.in('campaign_id', filters.campaign);
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
      
      // Transform the data to match our type
      const transformedData = (leadsData || []).map(lead => ({
        ...lead,
        campaigns: Array.isArray(lead.campaigns) ? lead.campaigns[0] || null : lead.campaigns
      }));
      
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
      
      // Transform to expected format
      return data?.map(item => ({
        ...item,
        created_at: item.received_at || new Date().toISOString() // Use received_at as fallback
      })) || [];
    },
    enabled: !!leadId,
    staleTime: 60 * 1000,
  });
};

// Smartlead Campaign hooks
export const useSmartleadCampaigns = () => {
  return useQuery({
    queryKey: ['smartleadCampaigns'],
    queryFn: async (): Promise<SmartleadCampaign[]> => {
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
    queryFn: async (): Promise<SmartleadMetrics> => {
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