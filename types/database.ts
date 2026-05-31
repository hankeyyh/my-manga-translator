export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      credit_logs: {
        Row: {
          biz_type: string | null
          created_at: string
          id: string
          image_id: string | null
          paytouse_credit_change: number
          paytouse_frozen_change: number
          subscription_credit_change: number
          subscription_frozen_change: number
          task_id: string | null
          total_credit_change: number
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          biz_type?: string | null
          created_at?: string
          id?: string
          image_id?: string | null
          paytouse_credit_change?: number
          paytouse_frozen_change?: number
          subscription_credit_change?: number
          subscription_frozen_change?: number
          task_id?: string | null
          total_credit_change?: number
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          biz_type?: string | null
          created_at?: string
          id?: string
          image_id?: string | null
          paytouse_credit_change?: number
          paytouse_frozen_change?: number
          subscription_credit_change?: number
          subscription_frozen_change?: number
          task_id?: string | null
          total_credit_change?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "user_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_config: {
        Row: {
          created_at: string
          credit_per_image: number
          id: string
          model_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_per_image: number
          id?: string
          model_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_per_image?: number
          id?: string
          model_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      topup_config: {
        Row: {
          billing_cycle: string | null
          created_at: string
          credits_included: number
          id: string
          is_active: boolean
          pack_tier: string | null
          plan_tier: string | null
          price: number
          stripe_price_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          credits_included: number
          id?: string
          is_active?: boolean
          pack_tier?: string | null
          plan_tier?: string | null
          price: number
          stripe_price_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          credits_included?: number
          id?: string
          is_active?: boolean
          pack_tier?: string | null
          plan_tier?: string | null
          price?: number
          stripe_price_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      translation_images: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          filename: string
          folder_name: string | null
          id: string
          image_index: number
          max_retries: number | null
          metadata: Json | null
          original_image_height: number | null
          original_image_path: string
          original_image_size: number | null
          original_image_width: number | null
          result_image_path: string | null
          retry_count: number | null
          started_at: string | null
          status: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          filename?: string
          folder_name?: string | null
          id?: string
          image_index: number
          max_retries?: number | null
          metadata?: Json | null
          original_image_height?: number | null
          original_image_path: string
          original_image_size?: number | null
          original_image_width?: number | null
          result_image_path?: string | null
          retry_count?: number | null
          started_at?: string | null
          status: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          filename?: string
          folder_name?: string | null
          id?: string
          image_index?: number
          max_retries?: number | null
          metadata?: Json | null
          original_image_height?: number | null
          original_image_path?: string
          original_image_size?: number | null
          original_image_width?: number | null
          result_image_path?: string | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_images_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "translation_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_tasks: {
        Row: {
          completed_at: string | null
          completed_images: number
          config: Json
          created_at: string | null
          failed_images: number
          id: string
          metadata: Json | null
          progress: number | null
          started_at: string | null
          status: string
          total_images: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_images?: number
          config?: Json
          created_at?: string | null
          failed_images?: number
          id?: string
          metadata?: Json | null
          progress?: number | null
          started_at?: string | null
          status: string
          total_images?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_images?: number
          config?: Json
          created_at?: string | null
          failed_images?: number
          id?: string
          metadata?: Json | null
          progress?: number | null
          started_at?: string | null
          status?: string
          total_images?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          id: string
          pay_to_use_balance: number
          pay_to_use_frozen: number
          subscription_balance: number
          subscription_frozen: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pay_to_use_balance?: number
          pay_to_use_frozen?: number
          subscription_balance?: number
          subscription_frozen?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pay_to_use_balance?: number
          pay_to_use_frozen?: number
          subscription_balance?: number
          subscription_frozen?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_ended_at: string
          current_period_started_at: string
          id: string
          plan_tier: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle: string
          created_at?: string
          current_period_ended_at: string
          current_period_started_at: string
          id?: string
          plan_tier: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_ended_at?: string
          current_period_started_at?: string
          id?: string
          plan_tier?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_transactions: {
        Row: {
          billing_cycle: string | null
          canceled_at: string | null
          created_at: string
          credits: number | null
          failed_at: string | null
          id: string
          pack_tier: string | null
          plan_tier: string | null
          recharge_amount: number
          stripe_session_id: string | null
          subscription_ended_at: string | null
          subscription_started_at: string | null
          succeeded_at: string | null
          transaction_status: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string
          credits?: number | null
          failed_at?: string | null
          id?: string
          pack_tier?: string | null
          plan_tier?: string | null
          recharge_amount: number
          stripe_session_id?: string | null
          subscription_ended_at?: string | null
          subscription_started_at?: string | null
          succeeded_at?: string | null
          transaction_status: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string
          credits?: number | null
          failed_at?: string | null
          id?: string
          pack_tier?: string | null
          plan_tier?: string | null
          recharge_amount?: number
          stripe_session_id?: string | null
          subscription_ended_at?: string | null
          subscription_started_at?: string | null
          succeeded_at?: string | null
          transaction_status?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      capture_image_credits: {
        Args: {
          p_consume_credits: number
          p_image_id: string
          p_task_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      freeze_task_credits: {
        Args: { p_credits: number; p_task_id: string; p_user_id: string }
        Returns: undefined
      }
      refund_image_credits: {
        Args: {
          p_image_id: string
          p_refund_credits: number
          p_task_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      succeed_transaction: {
        Args: { p_transaction_id: string }
        Returns: boolean
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

