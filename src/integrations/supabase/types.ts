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
      conversations: {
        Row: {
          created_at: string
          finder_id: string
          id: string
          request_id: string | null
          requester_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          finder_id: string
          id?: string
          request_id?: string | null
          requester_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          finder_id?: string
          id?: string
          request_id?: string | null
          requester_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_finder_id_fkey"
            columns: ["finder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_finder_id_fkey"
            columns: ["finder_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          seq: number
          status: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          seq?: number
          status?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          seq?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string | null
          delivery_days: number
          finder_id: string
          id: string
          message: string
          price: number
          request_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_days: number
          finder_id: string
          id?: string
          message: string
          price: number
          request_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_days?: number
          finder_id?: string
          id?: string
          message?: string
          price?: number
          request_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_finder_id_fkey"
            columns: ["finder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_finder_id_fkey"
            columns: ["finder_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          flutterwave_tx_id: string | null
          flutterwave_tx_ref: string
          id: string
          payment_type: string | null
          phone_number: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          flutterwave_tx_id?: string | null
          flutterwave_tx_ref: string
          id?: string
          payment_type?: string | null
          phone_number?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          flutterwave_tx_id?: string | null
          flutterwave_tx_ref?: string
          id?: string
          payment_type?: string | null
          phone_number?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          balance: number | null
          bio: string | null
          completed_tasks: number | null
          created_at: string | null
          id: string
          is_premium: boolean | null
          joined_date: string | null
          location: string | null
          name: string
          premium_upgraded_at: string | null
          rating: number | null
          response_time: string | null
          skills: string[] | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          avatar?: string | null
          balance?: number | null
          bio?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          id: string
          is_premium?: boolean | null
          joined_date?: string | null
          location?: string | null
          name: string
          premium_upgraded_at?: string | null
          rating?: number | null
          response_time?: string | null
          skills?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar?: string | null
          balance?: number | null
          bio?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          joined_date?: string | null
          location?: string | null
          name?: string
          premium_upgraded_at?: string | null
          rating?: number | null
          response_time?: string | null
          skills?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reported_type?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          budget_max: number
          budget_min: number
          category: string
          created_at: string | null
          deadline: string
          description: string
          id: string
          image_url: string | null
          location: string
          offer_count: number | null
          posted_by_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_max: number
          budget_min: number
          category: string
          created_at?: string | null
          deadline: string
          description: string
          id?: string
          image_url?: string | null
          location: string
          offer_count?: number | null
          posted_by_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_max?: number
          budget_min?: number
          category?: string
          created_at?: string | null
          deadline?: string
          description?: string
          id?: string
          image_url?: string | null
          location?: string
          offer_count?: number | null
          posted_by_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_posted_by_id_fkey"
            columns: ["posted_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_posted_by_id_fkey"
            columns: ["posted_by_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          request_id: string
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          request_id: string
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          request_id?: string
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          target_user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          completed_tasks: number | null
          created_at: string | null
          id: string | null
          is_premium: boolean | null
          joined_date: string | null
          location: string | null
          name: string | null
          rating: number | null
          response_time: string | null
          skills: string[] | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          id?: string | null
          is_premium?: boolean | null
          joined_date?: string | null
          location?: string | null
          name?: string | null
          rating?: number | null
          response_time?: string | null
          skills?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          id?: string | null
          is_premium?: boolean | null
          joined_date?: string | null
          location?: string | null
          name?: string | null
          rating?: number | null
          response_time?: string | null
          skills?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_all_users: {
        Args: never
        Returns: {
          avatar: string
          completed_tasks: number
          id: string
          joined_date: string
          name: string
          rating: number
          roles: string[]
          verified: boolean
        }[]
      }
      check_finder_can_place_offer: {
        Args: { p_finder_id: string }
        Returns: {
          accepted_count: number
          can_place: boolean
          is_premium: boolean
        }[]
      }
      get_conversations_with_last_message: {
        Args: { p_user_id: string }
        Returns: {
          finder_avatar: string
          finder_id: string
          finder_name: string
          id: string
          last_message_at: string
          last_message_content: string
          request_id: string
          request_title: string
          requester_avatar: string
          requester_id: string
          requester_name: string
          updated_at: string
        }[]
      }
      get_public_user_with_role: {
        Args: { p_user_id: string }
        Returns: {
          avatar: string
          bio: string
          completed_tasks: number
          id: string
          joined_date: string
          location: string
          name: string
          rating: number
          response_time: string
          role: string
          skills: string[]
          verified: boolean
        }[]
      }
      get_user_with_role: {
        Args: { p_user_id: string }
        Returns: {
          avatar: string
          balance: number
          bio: string
          completed_tasks: number
          id: string
          joined_date: string
          location: string
          name: string
          rating: number
          response_time: string
          role: string
          skills: string[]
          verified: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      manage_user_role: {
        Args: {
          _action: string
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      update_user_profile_secure: {
        Args: {
          _avatar?: string
          _bio?: string
          _location?: string
          _name?: string
          _response_time?: string
          _skills?: string[]
        }
        Returns: undefined
      }
      upgrade_to_premium: {
        Args: { p_tx_ref: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "guest" | "requester" | "finder" | "admin"
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
      app_role: ["guest", "requester", "finder", "admin"],
    },
  },
} as const
