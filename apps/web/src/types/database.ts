export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "parent" | "admin";
          full_name: string | null;
          email: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: "parent" | "admin";
          full_name?: string | null;
          email: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          display_name: string;
          birth_date: string;
          school_name: string | null;
          school_standard: string | null;
          avatar_url: string | null;
          favorite_themes: string[] | null;
          favorite_color: string | null;
          preferred_reward_style: string | null;
          preferred_avatar_style: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          display_name: string;
          birth_date: string;
          school_name?: string | null;
          school_standard?: string | null;
          avatar_url?: string | null;
          favorite_themes?: string[] | null;
          favorite_color?: string | null;
          preferred_reward_style?: string | null;
          preferred_avatar_style?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["children"]["Insert"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          title: string;
          slug: string;
          type: string;
          age_min: number;
          age_max: number;
          difficulty: number;
          instructions_text: string;
          instructions_audio_url: string | null;
          thumbnail_url: string | null;
          config_json: Json;
          default_theme_id: string | null;
          theme_ids: string[] | null;
          visual_config_json: Json;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          type: string;
          age_min: number;
          age_max: number;
          difficulty: number;
          instructions_text: string;
          instructions_audio_url?: string | null;
          thumbnail_url?: string | null;
          config_json: Json;
          default_theme_id?: string | null;
          theme_ids?: string[] | null;
          visual_config_json?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [];
      };
      activity_items: {
        Row: {
          id: string;
          activity_id: string;
          order_index: number;
          prompt_text: string | null;
          config_json: Json;
          answer_json: Json;
          asset_references_json: Json;
          difficulty_override: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          order_index: number;
          prompt_text?: string | null;
          config_json: Json;
          answer_json?: Json;
          asset_references_json?: Json;
          difficulty_override?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_items"]["Insert"]>;
        Relationships: [];
      };
      activity_attempts: {
        Row: {
          id: string;
          child_id: string;
          activity_id: string;
          score: number;
          stars_earned: number;
          completed: boolean;
          hints_used: number;
          mistakes_count: number;
          duration_seconds: number;
          started_at: string;
          finished_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          activity_id: string;
          score: number;
          stars_earned: number;
          completed: boolean;
          hints_used?: number;
          mistakes_count?: number;
          duration_seconds: number;
          started_at: string;
          finished_at: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["activity_attempts"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
