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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          created_by: string
          decided_at: string | null
          decided_by: string | null
          id: string
          lead_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          lead_id: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          lead_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interest: string | null
          messages: Json
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interest?: string | null
          messages?: Json
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interest?: string | null
          messages?: Json
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_contacts: {
        Row: {
          business_name: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          created_at: string
          event: string
          id: string
          label: string | null
          utm: Json
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          label?: string | null
          utm?: Json
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          label?: string | null
          utm?: Json
        }
        Relationships: []
      }
      leads: {
        Row: {
          consent: boolean
          contact_id: string
          created_at: string
          destination: string | null
          details: Json
          id: string
          lead_type: string
          origin: string | null
          owner: string | null
          priority: string
          reference: string
          source: string | null
          status: string
          travel_date: string | null
          updated_at: string
          urgency: string | null
          utm: Json
          weight: string | null
        }
        Insert: {
          consent?: boolean
          contact_id: string
          created_at?: string
          destination?: string | null
          details?: Json
          id?: string
          lead_type: string
          origin?: string | null
          owner?: string | null
          priority: string
          reference: string
          source?: string | null
          status?: string
          travel_date?: string | null
          updated_at?: string
          urgency?: string | null
          utm?: Json
          weight?: string | null
        }
        Update: {
          consent?: boolean
          contact_id?: string
          created_at?: string
          destination?: string | null
          details?: Json
          id?: string
          lead_type?: string
          origin?: string | null
          owner?: string | null
          priority?: string
          reference?: string
          source?: string | null
          status?: string
          travel_date?: string | null
          updated_at?: string
          urgency?: string | null
          utm?: Json
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "lead_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_submissions: {
        Row: {
          business_challenges: string[] | null
          business_name: string | null
          business_sells: string[] | null
          business_sells_other: string | null
          business_send_frequency: string | null
          business_ships_to: string | null
          city: string | null
          consent_marketing: boolean
          country: string | null
          courier_areas: string | null
          courier_availability: string | null
          courier_capacity: string | null
          courier_vehicle: string | null
          created_at: string
          email: string | null
          full_name: string
          heard_about: string
          heard_about_other: string | null
          id: string
          phone: string
          roles: string[]
          sender_frequency: string | null
          sender_items: string | null
          sender_route_from: string | null
          sender_route_to: string | null
          source: string | null
          traveller_frequency: string | null
          traveller_next_trip: string | null
          traveller_route_from: string | null
          traveller_route_to: string | null
        }
        Insert: {
          business_challenges?: string[] | null
          business_name?: string | null
          business_sells?: string[] | null
          business_sells_other?: string | null
          business_send_frequency?: string | null
          business_ships_to?: string | null
          city?: string | null
          consent_marketing?: boolean
          country?: string | null
          courier_areas?: string | null
          courier_availability?: string | null
          courier_capacity?: string | null
          courier_vehicle?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          heard_about: string
          heard_about_other?: string | null
          id?: string
          phone: string
          roles: string[]
          sender_frequency?: string | null
          sender_items?: string | null
          sender_route_from?: string | null
          sender_route_to?: string | null
          source?: string | null
          traveller_frequency?: string | null
          traveller_next_trip?: string | null
          traveller_route_from?: string | null
          traveller_route_to?: string | null
        }
        Update: {
          business_challenges?: string[] | null
          business_name?: string | null
          business_sells?: string[] | null
          business_sells_other?: string | null
          business_send_frequency?: string | null
          business_ships_to?: string | null
          city?: string | null
          consent_marketing?: boolean
          country?: string | null
          courier_areas?: string | null
          courier_availability?: string | null
          courier_capacity?: string | null
          courier_vehicle?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          heard_about?: string
          heard_about_other?: string | null
          id?: string
          phone?: string
          roles?: string[]
          sender_frequency?: string | null
          sender_items?: string | null
          sender_route_from?: string | null
          sender_route_to?: string | null
          source?: string | null
          traveller_frequency?: string | null
          traveller_next_trip?: string | null
          traveller_route_from?: string | null
          traveller_route_to?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decide_booking: {
        Args: { p_booking_id: string; p_status: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_booking: { Args: { p_lead_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    },
  },
} as const
