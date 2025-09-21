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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          user_id?: string
        }
        Relationships: []
      }
      availability_periods: {
        Row: {
          count_weekdays: number
          created_at: string
          end_date: string
          id: string
          selected_weekdays: string[]
          start_date: string
          updated_at: string
          user_id: string
          weekend_excluded: boolean
        }
        Insert: {
          count_weekdays: number
          created_at?: string
          end_date: string
          id?: string
          selected_weekdays: string[]
          start_date: string
          updated_at?: string
          user_id: string
          weekend_excluded?: boolean
        }
        Update: {
          count_weekdays?: number
          created_at?: string
          end_date?: string
          id?: string
          selected_weekdays?: string[]
          start_date?: string
          updated_at?: string
          user_id?: string
          weekend_excluded?: boolean
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      guest_users: {
        Row: {
          browser_token: string
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          browser_token: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          browser_token?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          mission_id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mission_id: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mission_id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mission_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          accepted_at: string | null
          client_email: string
          client_name: string
          client_user_id: string | null
          created_at: string
          description: string | null
          desired_date: string | null
          desired_time: string | null
          guest_user_id: string | null
          id: string
          status: Database["public"]["Enums"]["mission_status"]
          technician_id: string
          title: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          client_email: string
          client_name: string
          client_user_id?: string | null
          created_at?: string
          description?: string | null
          desired_date?: string | null
          desired_time?: string | null
          guest_user_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["mission_status"]
          technician_id: string
          title: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          client_email?: string
          client_name?: string
          client_user_id?: string | null
          created_at?: string
          description?: string | null
          desired_date?: string | null
          desired_time?: string | null
          guest_user_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["mission_status"]
          technician_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_guest_user_id_fkey"
            columns: ["guest_user_id"]
            isOneToOne: false
            referencedRelation: "guest_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepts_travel: boolean | null
          address: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string
          description: string | null
          email: string | null
          first_name: string | null
          hourly_rate: number | null
          id: string
          last_name: string | null
          linkedin_url: string | null
          max_travel_distance: number | null
          phone: string | null
          postal_code: string | null
          profile_photo_url: string | null
          regions: string[] | null
          robot_brands: string[] | null
          robot_models: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepts_travel?: boolean | null
          address?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          max_travel_distance?: number | null
          phone?: string | null
          postal_code?: string | null
          profile_photo_url?: string | null
          regions?: string[] | null
          robot_brands?: string[] | null
          robot_models?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepts_travel?: boolean | null
          address?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          max_travel_distance?: number | null
          phone?: string | null
          postal_code?: string | null
          profile_photo_url?: string | null
          regions?: string[] | null
          robot_brands?: string[] | null
          robot_models?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_requests: {
        Row: {
          client_email: string | null
          created_at: string
          date_flexible: boolean | null
          deployment_address: string
          deployment_city: string
          id: string
          mission_date: string
          mission_type: string
        }
        Insert: {
          client_email?: string | null
          created_at?: string
          date_flexible?: boolean | null
          deployment_address: string
          deployment_city: string
          id?: string
          mission_date: string
          mission_type: string
        }
        Update: {
          client_email?: string | null
          created_at?: string
          date_flexible?: boolean | null
          deployment_address?: string
          deployment_city?: string
          id?: string
          mission_date?: string
          mission_type?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      technician_brands: {
        Row: {
          brand_id: string
          id: string
          user_id: string
        }
        Insert: {
          brand_id: string
          id?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_skills: {
        Row: {
          id: string
          skill_id: string
          user_id: string
        }
        Insert: {
          id?: string
          skill_id: string
          user_id: string
        }
        Update: {
          id?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mission_status: "pending" | "accepted" | "declined" | "completed"
      user_role: "client" | "technician" | "enterprise" | "freelance"
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
      mission_status: ["pending", "accepted", "declined", "completed"],
      user_role: ["client", "technician", "enterprise", "freelance"],
    },
  },
} as const
