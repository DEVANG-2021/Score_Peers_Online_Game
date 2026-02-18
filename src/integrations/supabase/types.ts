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
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      contests: {
        Row: {
          created_at: string
          created_by: string | null
          current_entries: number
          description: string | null
          end_time: string
          entry_fee: number
          id: string
          max_entries: number
          max_picks: number
          min_picks: number
          name: string
          prize_pool: number
          start_time: string
          status: Database["public"]["Enums"]["contest_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_entries?: number
          description?: string | null
          end_time: string
          entry_fee?: number
          id?: string
          max_entries?: number
          max_picks?: number
          min_picks?: number
          name: string
          prize_pool?: number
          start_time: string
          status?: Database["public"]["Enums"]["contest_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_entries?: number
          description?: string | null
          end_time?: string
          entry_fee?: number
          id?: string
          max_entries?: number
          max_picks?: number
          min_picks?: number
          name?: string
          prize_pool?: number
          start_time?: string
          status?: Database["public"]["Enums"]["contest_status"]
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          away_score: number | null
          away_team: string
          created_at: string
          home_score: number | null
          home_team: string
          id: string
          league: string
          moneyline_away: number | null
          moneyline_home: number | null
          sport: string
          spread: number | null
          start_time: string
          status: string
          total: number | null
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team: string
          created_at?: string
          home_score?: number | null
          home_team: string
          id?: string
          league: string
          moneyline_away?: number | null
          moneyline_home?: number | null
          sport: string
          spread?: number | null
          start_time: string
          status?: string
          total?: number | null
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team?: string
          created_at?: string
          home_score?: number | null
          home_team?: string
          id?: string
          league?: string
          moneyline_away?: number | null
          moneyline_home?: number | null
          sport?: string
          spread?: number | null
          start_time?: string
          status?: string
          total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      parlays: {
        Row: {
          contest_id: string
          created_at: string
          id: string
          potential_payout: number
          status: Database["public"]["Enums"]["parlay_status"]
          total_odds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: string
          potential_payout?: number
          status?: Database["public"]["Enums"]["parlay_status"]
          total_odds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: string
          potential_payout?: number
          status?: Database["public"]["Enums"]["parlay_status"]
          total_odds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parlays_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      picks: {
        Row: {
          created_at: string
          game_id: string
          id: string
          odds: number
          parlay_id: string
          pick_type: string
          result: Database["public"]["Enums"]["pick_result"]
          selection: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          odds: number
          parlay_id: string
          pick_type: string
          result?: Database["public"]["Enums"]["pick_result"]
          selection: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          odds?: number
          parlay_id?: string
          pick_type?: string
          result?: Database["public"]["Enums"]["pick_result"]
          selection?: string
        }
        Relationships: [
          {
            foreignKeyName: "picks_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_parlay_id_fkey"
            columns: ["parlay_id"]
            isOneToOne: false
            referencedRelation: "parlays"
            referencedColumns: ["id"]
          },
        ]
      }
      player_props: {
        Row: {
          away_team: string
          created_at: string
          game_date: string
          home_team: string
          id: string
          is_active: boolean
          league: string
          line: number
          over_odds: number | null
          player_image: string | null
          player_name: string
          prop_type: string
          sport: string
          under_odds: number | null
          updated_at: string
        }
        Insert: {
          away_team: string
          created_at?: string
          game_date: string
          home_team: string
          id?: string
          is_active?: boolean
          league: string
          line: number
          over_odds?: number | null
          player_image?: string | null
          player_name: string
          prop_type: string
          sport: string
          under_odds?: number | null
          updated_at?: string
        }
        Update: {
          away_team?: string
          created_at?: string
          game_date?: string
          home_team?: string
          id?: string
          is_active?: boolean
          league?: string
          line?: number
          over_odds?: number | null
          player_image?: string | null
          player_name?: string
          prop_type?: string
          sport?: string
          under_odds?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apt_number: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          gender: string | null
          id: string
          last_daily_reward: string | null
          last_name: string | null
          phone_number: string | null
          sp_cash_balance: number
          state: string | null
          street_address: string | null
          updated_at: string
          user_id: string
          username: string | null
          wallet_balance: number
          zipcode: string | null
        }
        Insert: {
          apt_number?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_daily_reward?: string | null
          last_name?: string | null
          phone_number?: string | null
          sp_cash_balance?: number
          state?: string | null
          street_address?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          wallet_balance?: number
          zipcode?: string | null
        }
        Update: {
          apt_number?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_daily_reward?: string | null
          last_name?: string | null
          phone_number?: string | null
          sp_cash_balance?: number
          state?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          wallet_balance?: number
          zipcode?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          issue_category: string
          last_name: string
          message: string
          phone_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          issue_category: string
          last_name: string
          message: string
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          issue_category?: string
          last_name?: string
          message?: string
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      contest_status: "upcoming" | "active" | "completed" | "cancelled"
      parlay_status: "pending" | "won" | "lost" | "cancelled"
      pick_result: "pending" | "won" | "lost" | "push"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "entry_fee"
        | "winnings"
        | "refund"
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
      contest_status: ["upcoming", "active", "completed", "cancelled"],
      parlay_status: ["pending", "won", "lost", "cancelled"],
      pick_result: ["pending", "won", "lost", "push"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "entry_fee",
        "winnings",
        "refund",
      ],
    },
  },
} as const
