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
      credits_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: number
          payment_id: number | null
          task_id: number | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: number
          payment_id?: number | null
          task_id?: number | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: number
          payment_id?: number | null
          task_id?: number | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_transactions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "translation_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          credits_purchased: number
          id: number
          metadata: Json | null
          payment_method: string | null
          payment_provider: string | null
          plan_type: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          credits_purchased: number
          id?: number
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          plan_type?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          credits_purchased?: number
          id?: number
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          plan_type?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      translation_cache: {
        Row: {
          accessed_at: string
          ai_model: string | null
          created_at: string
          engine_type: string
          extracted_text: Json | null
          hit_count: number
          id: number
          image_hash: string
          result_url: string
          source_lang: string
          target_lang: string
          translated_text: Json | null
          updated_at: string
        }
        Insert: {
          accessed_at?: string
          ai_model?: string | null
          created_at?: string
          engine_type: string
          extracted_text?: Json | null
          hit_count?: number
          id?: number
          image_hash: string
          result_url: string
          source_lang: string
          target_lang: string
          translated_text?: Json | null
          updated_at?: string
        }
        Update: {
          accessed_at?: string
          ai_model?: string | null
          created_at?: string
          engine_type?: string
          extracted_text?: Json | null
          hit_count?: number
          id?: number
          image_hash?: string
          result_url?: string
          source_lang?: string
          target_lang?: string
          translated_text?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      translation_images: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_text: Json | null
          id: number
          original_hash: string | null
          original_url: string
          page_number: number
          processing_time: number | null
          status: string
          task_id: number
          translated_text: Json | null
          translated_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_text?: Json | null
          id?: number
          original_hash?: string | null
          original_url: string
          page_number: number
          processing_time?: number | null
          status?: string
          task_id: number
          translated_text?: Json | null
          translated_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_text?: Json | null
          id?: number
          original_hash?: string | null
          original_url?: string
          page_number?: number
          processing_time?: number | null
          status?: string
          task_id?: number
          translated_text?: Json | null
          translated_url?: string | null
          updated_at?: string
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
          ai_model: string | null
          completed_at: string | null
          created_at: string
          credits_consumed: number | null
          download_url: string | null
          engine_type: string
          error_message: string | null
          expires_at: string | null
          id: number
          image_count: number | null
          source_lang: string
          started_at: string | null
          status: string
          target_lang: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          completed_at?: string | null
          created_at?: string
          credits_consumed?: number | null
          download_url?: string | null
          engine_type?: string
          error_message?: string | null
          expires_at?: string | null
          id?: number
          image_count?: number | null
          source_lang?: string
          started_at?: string | null
          status?: string
          target_lang?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model?: string | null
          completed_at?: string | null
          created_at?: string
          credits_consumed?: number | null
          download_url?: string | null
          engine_type?: string
          error_message?: string | null
          expires_at?: string | null
          id?: number
          image_count?: number | null
          source_lang?: string
          started_at?: string | null
          status?: string
          target_lang?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: number
          total_earned: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: number
          total_earned?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: number
          total_earned?: number
          total_used?: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

