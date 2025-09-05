// Dashboard types and interfaces

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
  startISO: string
  endISO: string
}

export interface DashboardFilters {
  dateRange: DateRange
  channel: string // Single channel, default to 'email'
  campaign?: string[] // Optional campaign filter - now supports multiple campaigns
  responseDateRange: DateRange // New filter for response received dates
}

// New enum types matching the database schema
export type ChannelEnum = 'email' | 'linkedin';

export type ResponseLabelEnum = 
  | 'Interested'
  | 'Referral'
  | 'Do not contact'
  | 'Not Interested'
  | 'Out of office'
  | 'Wrong person';

// Database table types matching the new schema
export interface Campaign {
  id: string
  campaign_name: string
  sector?: string
  is_active: boolean
  created_at: string
}

export interface Lead {
  id: string
  external_ref?: string
  full_name?: string
  email?: string
  linkedin_url?: string
  company_name?: string
  company_domain?: string
  campaign_id?: string
  first_touch_channel?: ChannelEnum
  outreach_copy?: string
  created_at: string
  updated_at: string
  campaigns?: {
    campaign_name: string
  }
}

export interface Response {
  id: string
  lead_id: string
  campaign_id?: string
  channel: ChannelEnum
  response_label?: ResponseLabelEnum
  response_text?: string
  webhook_received_date?: string
  webhook_time_of_day?: string
  webhook_weekday?: string
  leads?: {
    full_name?: string
    company_name?: string
  }
  campaigns?: {
    campaign_name: string
  }
}

// View types matching the new database views
export interface ChannelTotals {
  channel: ChannelEnum
  total_responses: number
}

export interface ChannelPositive {
  channel: ChannelEnum
  positive_count: number
  total_count: number
  positive_pct: number
}

export interface ResponsesByWeekday {
  channel: ChannelEnum
  received_weekday: number
  n_leads: number
}

export interface DailyCounts {
  received_date: string
  channel: ChannelEnum
  n: number
}

export interface CampaignSplit {
  campaign_name: string
  total_replies: number
  interested: number
  info_requested: number
}

// New interface for campaigns with date filtering capabilities
export interface CampaignWithDates {
  id: string
  campaign_name: string
  sector?: string
  is_active: boolean
  created_at: string
  received_date_iso_clay?: string
  latest_response_date?: string
  earliest_response_date?: string
  total_responses: number
  responses_last_7_days: number
  responses_last_30_days: number
}

// New interface for campaign performance with date filtering
export interface CampaignPerformanceDated {
  campaign_name: string
  sector?: string
  is_active: boolean
  latest_response_date?: string
  earliest_response_date?: string
  total_responses: number
  responses_last_7_days: number
  responses_last_30_days: number
  interested: number
  referral: number
  do_not_contact: number
  not_interested: number
  out_of_office: number
  wrong_person: number
  positive_response_rate: number
}

// Legacy types for backward compatibility
export interface EmailTotals {
  channel: string
  total_replies: number
}

export interface EmailPositive {
  channel: string
  positive_replies: number
  total_replies: number
}

export interface EmailWeekday {
  weekday: number | string // Support both legacy string and new numeric index
  weekdayIndex?: number // Explicit weekday index (1-7)
  weekdayName?: string // Weekday name for display
  count: number
}

export interface EmailDaily {
  received_date: string
  isoDate?: string // Explicit ISO date field
  dateObject?: Date // Date object for calculations
  count: number
  weekday?: number // Day of week (0-6, Sunday-Saturday)
}

export interface EmailsSent {
  total_emails_sent: number
}

// Smartlead Campaign types - Commented out
/*
export interface SmartleadCampaign {
  id: string
  campaign_name: string
  is_active: boolean
  created_at: string
  campaign_external_id?: string
  sent_count?: number
  bounce_count?: number
  total_count?: number
  reply_count?: number
}

export interface SmartleadMetrics {
  total_sent: number
  total_bounces: number
  total_replies: number
  total_campaigns: number
  active_campaigns: number
  average_reply_rate: number
  average_bounce_rate: number
}
*/

export interface CampaignSplitEmail {
  campaign_id?: string
  campaign_name: string
  total_replies: number
  positive_replies: number
  negative_replies: number
  success_rate?: number
}

export interface EmailResponse {
  id: string
  lead_id: string
  campaign_id: string
  channel: string
  response_label: string
  response_text: string
  created_at?: string
  received_at?: string
  received_date_iso_clay?: string
  time_of_day_iso?: string
  webhook_received_date?: string
  webhook_time_of_day?: string
  leads?: {
    company_name: string
    full_name: string
  }
  campaigns?: {
    campaign_name: string
  }
}

export interface EmailLead {
  id: string
  company_name: string
  full_name: string
  campaign_id: string
  first_touch_channel: string
  updated_at: string
  campaigns: {
    campaign_name: string
  } | null
}

export interface WeeklyResponse {
  weekday: string
  count: number
}

export interface ChannelData {
  channel: string
  total: number
  positive: number
  negative: number
}

export interface DailyCount {
  date: string
  count: number
}
