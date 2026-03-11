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
      activity_templates: {
        Row: {
          id: string;
          template_key: string;
          activity_type: string;
          interaction_type: string;
          title: string;
          description: string;
          learning_areas: string[] | null;
          difficulty_rules_json: Json;
          generation_rules_json: Json;
          explanation_text: string;
          fact_pool_json: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_key: string;
          activity_type: string;
          interaction_type: string;
          title: string;
          description: string;
          learning_areas?: string[] | null;
          difficulty_rules_json?: Json;
          generation_rules_json?: Json;
          explanation_text: string;
          fact_pool_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_templates"]["Insert"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          template_id: string | null;
          title: string;
          slug: string;
          type: string;
          interaction_type: string;
          age_min: number;
          age_max: number;
          difficulty: number;
          recommended_level: number;
          learning_areas: string[] | null;
          instructions_text: string;
          explanation_text: string | null;
          fun_fact: string | null;
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
          template_id?: string | null;
          title: string;
          slug: string;
          type: string;
          interaction_type: string;
          age_min: number;
          age_max: number;
          difficulty: number;
          recommended_level?: number;
          learning_areas?: string[] | null;
          instructions_text: string;
          explanation_text?: string | null;
          fun_fact?: string | null;
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
          activity_type: string;
          interaction_type: string;
          learning_areas: string[] | null;
          skill_areas: string[] | null;
          primary_skill_area: string | null;
          session_id: string | null;
          task_instance_id: string | null;
          generator_seed: string | null;
          level_played: number;
          difficulty_snapshot: number;
          score: number;
          success_rate: number;
          correct_answers_count: number;
          total_questions: number;
          stars_earned: number;
          completed: boolean;
          hints_used: number;
          mistakes_count: number;
          duration_seconds: number;
          explanation_text: string | null;
          fun_fact: string | null;
          learning_area_scores_json: Json;
          skill_area_scores_json: Json;
          mastery_level_before: number | null;
          mastery_level_after: number | null;
          mastery_score_before: number | null;
          mastery_score_after: number | null;
          level_advanced: boolean;
          needs_more_practice: string[] | null;
          started_at: string;
          finished_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          activity_id: string;
          activity_type: string;
          interaction_type: string;
          learning_areas?: string[] | null;
          skill_areas?: string[] | null;
          primary_skill_area?: string | null;
          session_id?: string | null;
          task_instance_id?: string | null;
          generator_seed?: string | null;
          level_played?: number;
          difficulty_snapshot?: number;
          score: number;
          success_rate?: number;
          correct_answers_count?: number;
          total_questions?: number;
          stars_earned: number;
          completed: boolean;
          hints_used?: number;
          mistakes_count?: number;
          duration_seconds: number;
          explanation_text?: string | null;
          fun_fact?: string | null;
          learning_area_scores_json?: Json;
          skill_area_scores_json?: Json;
          mastery_level_before?: number | null;
          mastery_level_after?: number | null;
          mastery_score_before?: number | null;
          mastery_score_after?: number | null;
          level_advanced?: boolean;
          needs_more_practice?: string[] | null;
          started_at: string;
          finished_at: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["activity_attempts"]["Insert"]
        >;
        Relationships: [];
      };
      generated_task_instances: {
        Row: {
          id: string;
          session_id: string;
          activity_id: string;
          child_id: string | null;
          activity_type: string;
          skill_area: string;
          skill_areas: string[] | null;
          level: number;
          generator_seed: string;
          generator_version: string;
          generated_config_json: Json;
          expected_answer_json: Json;
          generated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          activity_id: string;
          child_id?: string | null;
          activity_type: string;
          skill_area: string;
          skill_areas?: string[] | null;
          level?: number;
          generator_seed: string;
          generator_version: string;
          generated_config_json?: Json;
          expected_answer_json?: Json;
          generated_at?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["generated_task_instances"]["Insert"]
        >;
        Relationships: [];
      };
      child_skill_progress: {
        Row: {
          id: string;
          child_id: string;
          skill_area: string;
          current_level: number;
          mastery_score: number;
          attempts_at_current_level: number;
          successful_attempts_at_current_level: number;
          average_success_rate: number;
          average_mistakes: number;
          average_duration_seconds: number;
          weakness_score: number;
          status: string;
          level_label: string;
          positive_summary: string;
          next_goal: string;
          last_practiced_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          skill_area: string;
          current_level?: number;
          mastery_score?: number;
          attempts_at_current_level?: number;
          successful_attempts_at_current_level?: number;
          average_success_rate?: number;
          average_mistakes?: number;
          average_duration_seconds?: number;
          weakness_score?: number;
          status?: string;
          level_label: string;
          positive_summary: string;
          next_goal: string;
          last_practiced_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["child_skill_progress"]["Insert"]>;
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description: string;
          image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["badges"]["Insert"]>;
        Relationships: [];
      };
      child_badges: {
        Row: {
          id: string;
          child_id: string;
          badge_id: string;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          badge_id: string;
          awarded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["child_badges"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
