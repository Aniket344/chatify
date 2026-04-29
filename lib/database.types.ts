export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          user_id: string
          role: string
          is_pinned: boolean
          is_muted: boolean
          is_archived: boolean
          last_read_at: string | null
          joined_at: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          user_id: string
          role?: string
          is_pinned?: boolean
          is_muted?: boolean
          is_archived?: boolean
          last_read_at?: string | null
          joined_at?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          user_id?: string
          role?: string
          is_pinned?: boolean
          is_muted?: boolean
          is_archived?: boolean
          last_read_at?: string | null
          joined_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_direct: boolean
          direct_key: string | null
          is_group: boolean
          name: string | null
          avatar_url: string | null
          created_by: string | null
          updated_at: string
          last_message_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_direct?: boolean
          direct_key?: string | null
          is_group?: boolean
          name?: string | null
          avatar_url?: string | null
          created_by?: string | null
          updated_at?: string
          last_message_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_direct?: boolean
          direct_key?: string | null
          is_group?: boolean
          name?: string | null
          avatar_url?: string | null
          created_by?: string | null
          updated_at?: string
          last_message_id?: string | null
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
        Relationships: []
      }
      message_receipts: {
        Row: {
          message_id: string
          user_id: string
          seen_at: string
        }
        Insert: {
          message_id: string
          user_id: string
          seen_at?: string
        }
        Update: {
          message_id?: string
          user_id?: string
          seen_at?: string
        }
        Relationships: []
      }
      message_user_deletions: {
        Row: {
          message_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          message_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          message_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_url: string | null
          id: string
          message_type: "file" | "image" | "text" | "voice" | "system"
          receiver_id: string | null
          seen_at: string | null
          sender_id: string
          reply_to_id: string | null
          forward_of_id: string | null
          edited_at: string | null
          deleted_at: string | null
          deleted_for_everyone: boolean
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: "file" | "image" | "text" | "voice" | "system"
          receiver_id?: string | null
          seen_at?: string | null
          sender_id: string
          reply_to_id?: string | null
          forward_of_id?: string | null
          edited_at?: string | null
          deleted_at?: string | null
          deleted_for_everyone?: boolean
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: "file" | "image" | "text" | "voice" | "system"
          receiver_id?: string | null
          seen_at?: string | null
          sender_id?: string
          reply_to_id?: string | null
          forward_of_id?: string | null
          edited_at?: string | null
          deleted_at?: string | null
          deleted_for_everyone?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          bio: string | null
          last_seen_at: string | null
          status_text: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          bio?: string | null
          last_seen_at?: string | null
          status_text?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          bio?: string | null
          last_seen_at?: string | null
          status_text?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      statuses: {
        Row: {
          id: string
          user_id: string
          content_url: string | null
          content_type: string
          caption: string | null
          background: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_url?: string | null
          content_type?: string
          caption?: string | null
          background?: string | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_url?: string | null
          content_type?: string
          caption?: string | null
          background?: string | null
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      status_views: {
        Row: {
          status_id: string
          viewer_id: string
          viewed_at: string
        }
        Insert: {
          status_id: string
          viewer_id: string
          viewed_at?: string
        }
        Update: {
          status_id?: string
          viewer_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_chat_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
        }[]
      }
      get_chat_list: {
        Args: Record<PropertyKey, never>
        Returns: {
          conversation_id: string
          is_direct: boolean
          is_group: boolean
          display_name: string
          display_avatar: string | null
          other_user_id: string | null
          last_message_content: string | null
          last_message_at: string | null
          unread_count: number
          is_pinned: boolean
          is_muted: boolean
        }[]
      }
      get_or_create_direct_conversation: {
        Args: {
          other_user_id: string
        }
        Returns: string
      }
      create_group: {
        Args: {
          group_name: string
          member_ids: string[]
        }
        Returns: string
      }
      toggle_pin: { Args: { target_conversation_id: string }; Returns: undefined }
      toggle_mute: { Args: { target_conversation_id: string }; Returns: undefined }
      mark_conversation_read: { Args: { target_conversation_id: string }; Returns: undefined }
      edit_message: { Args: { target_message_id: string; new_content: string }; Returns: undefined }
      delete_message: { Args: { target_message_id: string; for_everyone: boolean }; Returns: undefined }
      react_to_message: { Args: { target_message_id: string; emoji: string }; Returns: undefined }
      unreact_message: { Args: { target_message_id: string; emoji: string }; Returns: undefined }
      update_last_seen: { Args: Record<PropertyKey, never>; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
