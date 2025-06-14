export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      automation_jobs: {
        Row: {
          completed_at: string | null
          content_idea_id: string | null
          created_at: string
          current_step: string | null
          error_message: string | null
          id: string
          job_type: string
          progress: number | null
          script_id: string | null
          started_at: string | null
          status: string
          total_steps: number | null
          updated_at: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          completed_at?: string | null
          content_idea_id?: string | null
          created_at?: string
          current_step?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          progress?: number | null
          script_id?: string | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
          updated_at?: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          completed_at?: string | null
          content_idea_id?: string | null
          created_at?: string
          current_step?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          progress?: number | null
          script_id?: string | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
          updated_at?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_jobs_content_idea_id_fkey"
            columns: ["content_idea_id"]
            isOneToOne: false
            referencedRelation: "content_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_jobs_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_jobs_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_settings: {
        Row: {
          auto_assemble_videos: boolean | null
          auto_generate_ideas: boolean | null
          auto_generate_scripts: boolean | null
          auto_generate_voice: boolean | null
          auto_upload_youtube: boolean | null
          created_at: string
          generation_frequency: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_assemble_videos?: boolean | null
          auto_generate_ideas?: boolean | null
          auto_generate_scripts?: boolean | null
          auto_generate_voice?: boolean | null
          auto_upload_youtube?: boolean | null
          created_at?: string
          generation_frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_assemble_videos?: boolean | null
          auto_generate_ideas?: boolean | null
          auto_generate_scripts?: boolean | null
          auto_generate_voice?: boolean | null
          auto_upload_youtube?: boolean | null
          created_at?: string
          generation_frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      channel_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          total_revenue: number | null
          total_subscribers: number | null
          total_views: number | null
          user_id: string | null
          videos_published: number | null
          watch_time_hours: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_revenue?: number | null
          total_subscribers?: number | null
          total_views?: number | null
          user_id?: string | null
          videos_published?: number | null
          watch_time_hours?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_revenue?: number | null
          total_subscribers?: number | null
          total_views?: number | null
          user_id?: string | null
          videos_published?: number | null
          watch_time_hours?: number | null
        }
        Relationships: []
      }
      content_ideas: {
        Row: {
          category: string | null
          competition: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          estimated_views: string | null
          id: string
          keywords: string[] | null
          script_status: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          competition?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_views?: string | null
          id?: string
          keywords?: string[] | null
          script_status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          competition?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_views?: string | null
          id?: string
          keywords?: string[] | null
          script_status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scripts: {
        Row: {
          content_idea_id: string | null
          created_at: string
          duration: string | null
          id: string
          script_content: string | null
          style: string | null
          target_audience: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content_idea_id?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          script_content?: string | null
          style?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content_idea_id?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          script_content?: string | null
          style?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_content_idea_id_fkey"
            columns: ["content_idea_id"]
            isOneToOne: false
            referencedRelation: "content_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          comments: number | null
          created_at: string
          id: string
          likes: number | null
          published_at: string | null
          revenue: number | null
          script_id: string | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string | null
          video_url: string | null
          views: number | null
          youtube_video_id: string | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          id?: string
          likes?: number | null
          published_at?: string | null
          revenue?: number | null
          script_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
          views?: number | null
          youtube_video_id?: string | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          id?: string
          likes?: number | null
          published_at?: string | null
          revenue?: number | null
          script_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
          views?: number | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_generations: {
        Row: {
          audio_url: string | null
          created_at: string
          duration: number | null
          id: string
          script_id: string | null
          user_id: string | null
          voice_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          script_id?: string | null
          user_id?: string | null
          voice_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          script_id?: string | null
          user_id?: string | null
          voice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_generations_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_automation_job_progress: {
        Args: {
          job_id: string
          new_status: string
          new_step?: string
          new_progress?: number
          error_msg?: string
        }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
