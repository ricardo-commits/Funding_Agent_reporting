export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          campaign_name: string
          created_at: string
          id: string
          is_active: boolean
          sector: string | null
        }
        Insert: {
          campaign_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          sector?: string | null
        }
        Update: {
          campaign_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sector?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          campaign_id: string | null
          company_domain: string | null
          company_name: string | null
          created_at: string
          email: string | null
          external_ref: string | null
          first_touch_channel:
            | Database["public"]["Enums"]["channel_enum"]
            | null
          full_name: string | null
          id: string
          linkedin_url: string | null
          outreach_copy: string | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          company_domain?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          external_ref?: string | null
          first_touch_channel?:
            | Database["public"]["Enums"]["channel_enum"]
            | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          outreach_copy?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          company_domain?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          external_ref?: string | null
          first_touch_channel?:
            | Database["public"]["Enums"]["channel_enum"]
            | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          outreach_copy?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          campaign_id: string | null
          channel: Database["public"]["Enums"]["channel_enum"]
          id: string
          lead_id: string
          response_label:
            | Database["public"]["Enums"]["response_label_enum"]
            | null
          response_text_combined: string | null
          response_text_email: string | null
          webhook_received_date: string | null
          webhook_time_of_day: string | null
          webhook_weekday: string | null
        }
        Insert: {
          campaign_id?: string | null
          channel: Database["public"]["Enums"]["channel_enum"]
          id?: string
          lead_id: string
          response_label?:
            | Database["public"]["Enums"]["response_label_enum"]
            | null
          response_text_combined?: string | null
          response_text_email?: string | null
          webhook_received_date?: string | null
          webhook_time_of_day?: string | null
          webhook_weekday?: string | null
        }
        Update: {
          campaign_id?: string | null
          channel?: Database["public"]["Enums"]["channel_enum"]
          id?: string
          lead_id?: string
          response_label?:
            | Database["public"]["Enums"]["response_label_enum"]
            | null
          response_text_combined?: string | null
          response_text_email?: string | null
          webhook_received_date?: string | null
          webhook_time_of_day?: string | null
          webhook_weekday?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_campaign_split: {
        Row: {
          campaign_name: string | null
          info_requested: number | null
          interested: number | null
          total_replies: number | null
        }
        Relationships: []
      }
      v_channel_positive: {
        Row: {
          channel: Database["public"]["Enums"]["channel_enum"] | null
          positive_count: number | null
          positive_pct: number | null
          total_count: number | null
        }
        Relationships: []
      }
      v_channel_totals: {
        Row: {
          channel: Database["public"]["Enums"]["channel_enum"] | null
          total_responses: number | null
        }
        Relationships: []
      }
      v_daily_counts: {
        Row: {
          channel: Database["public"]["Enums"]["channel_enum"] | null
          n: number | null
          received_date: string | null
        }
        Relationships: []
      }
      v_responses_by_weekday: {
        Row: {
          channel: Database["public"]["Enums"]["channel_enum"] | null
          n_leads: number | null
          received_weekday: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      ingest_lead_info_from_clay: {
        Args: {
          p_campaign_name: string
          p_company_name: string
          p_copy: string
          p_email_body: string
          p_platform: string
          p_response_combined: string
          p_response_label: Database["public"]["Enums"]["response_label_enum"]
          p_sender_full_name: string
          p_time_of_day: string
          p_true_date_received: string
        }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      channel_enum: "email" | "linkedin"
      response_label_enum:
        | "Interested"
        | "Information Requested"
        | "Meeting Request"
        | "Not Interested"
        | "Out of office"
        | "Wrong person"
        | "Referral"
        | "Unsubscribe"
        | "Do not contact"
        | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      channel_enum: ["email", "linkedin"],
      response_label_enum: [
        "Interested",
        "Information Requested",
        "Meeting Request",
        "Not Interested",
        "Out of office",
        "Wrong person",
        "Referral",
        "Unsubscribe",
        "Do not contact",
        "Other",
      ],
    },
  },
} as const
