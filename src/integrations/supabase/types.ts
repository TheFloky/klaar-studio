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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          content_md: string
          cover_attribution: string | null
          cover_image_url: string | null
          cover_source: string | null
          created_at: string
          excerpt: string
          external_links: Json | null
          fact_check_notes: Json | null
          id: string
          lang: string
          published_at: string | null
          reading_time_min: number | null
          seo_description: string
          seo_title: string
          slug: string
          source_input: string | null
          status: string
          tags: string[] | null
          title: string
          translation_group_id: string
          updated_at: string
        }
        Insert: {
          content_md: string
          cover_attribution?: string | null
          cover_image_url?: string | null
          cover_source?: string | null
          created_at?: string
          excerpt: string
          external_links?: Json | null
          fact_check_notes?: Json | null
          id?: string
          lang: string
          published_at?: string | null
          reading_time_min?: number | null
          seo_description: string
          seo_title: string
          slug: string
          source_input?: string | null
          status?: string
          tags?: string[] | null
          title: string
          translation_group_id?: string
          updated_at?: string
        }
        Update: {
          content_md?: string
          cover_attribution?: string | null
          cover_image_url?: string | null
          cover_source?: string | null
          created_at?: string
          excerpt?: string
          external_links?: Json | null
          fact_check_notes?: Json | null
          id?: string
          lang?: string
          published_at?: string | null
          reading_time_min?: number | null
          seo_description?: string
          seo_title?: string
          slug?: string
          source_input?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          translation_group_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          business: string
          calendar_event_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          needs: string
          slot_end: string
          slot_start: string
          status: string
          tier: string | null
        }
        Insert: {
          business: string
          calendar_event_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          needs: string
          slot_end: string
          slot_start: string
          status?: string
          tier?: string | null
        }
        Update: {
          business?: string
          calendar_event_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          needs?: string
          slot_end?: string
          slot_start?: string
          status?: string
          tier?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          compliance_details: Json | null
          compliance_score: number | null
          created_at: string
          id: string
          maintenance_fee: number | null
          name: string | null
          niche: string | null
          project_fee: number | null
          status: string | null
          tier: string | null
          todos: Json | null
          updated_at: string
          website: string
        }
        Insert: {
          compliance_details?: Json | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          maintenance_fee?: number | null
          name?: string | null
          niche?: string | null
          project_fee?: number | null
          status?: string | null
          tier?: string | null
          todos?: Json | null
          updated_at?: string
          website: string
        }
        Update: {
          compliance_details?: Json | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          maintenance_fee?: number | null
          name?: string | null
          niche?: string | null
          project_fee?: number | null
          status?: string | null
          tier?: string | null
          todos?: Json | null
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      pageviews: {
        Row: {
          country: string | null
          created_at: string
          device_type: string | null
          duration_ms: number | null
          id: string
          language: string | null
          path: string
          referrer: string | null
          session_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          language?: string | null
          path: string
          referrer?: string | null
          session_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          language?: string | null
          path?: string
          referrer?: string | null
          session_id?: string
        }
        Relationships: []
      }
      prospects: {
        Row: {
          company_name: string | null
          compliance_details: Json | null
          compliance_score: number | null
          contacts: Json | null
          created_at: string
          demo_site_password: string | null
          demo_site_url: string | null
          description: string | null
          email_demo_sent: boolean
          email_draft: string | null
          email_language: string | null
          email_sent: boolean
          email_subject: string | null
          financials: Json | null
          id: string
          meeting_done: boolean
          niche: string | null
          reputation: Json | null
          research_summary: string | null
          status: string | null
          updated_at: string
          website: string
        }
        Insert: {
          company_name?: string | null
          compliance_details?: Json | null
          compliance_score?: number | null
          contacts?: Json | null
          created_at?: string
          demo_site_password?: string | null
          demo_site_url?: string | null
          description?: string | null
          email_demo_sent?: boolean
          email_draft?: string | null
          email_language?: string | null
          email_sent?: boolean
          email_subject?: string | null
          financials?: Json | null
          id?: string
          meeting_done?: boolean
          niche?: string | null
          reputation?: Json | null
          research_summary?: string | null
          status?: string | null
          updated_at?: string
          website: string
        }
        Update: {
          company_name?: string | null
          compliance_details?: Json | null
          compliance_score?: number | null
          contacts?: Json | null
          created_at?: string
          demo_site_password?: string | null
          demo_site_url?: string | null
          description?: string | null
          email_demo_sent?: boolean
          email_draft?: string | null
          email_language?: string | null
          email_sent?: boolean
          email_subject?: string | null
          financials?: Json | null
          id?: string
          meeting_done?: boolean
          niche?: string | null
          reputation?: Json | null
          research_summary?: string | null
          status?: string | null
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
