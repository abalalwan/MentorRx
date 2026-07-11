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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          mentor_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          mentor_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          mentor_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_exceptions: {
        Row: {
          created_at: string
          end_time: string | null
          exception_date: string
          id: string
          is_available: boolean
          mentor_id: string
          reason: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          exception_date: string
          id?: string
          is_available?: boolean
          mentor_id: string
          reason?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          exception_date?: string
          id?: string
          is_available?: boolean
          mentor_id?: string
          reason?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "availability_exceptions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          currency: string
          duration_minutes: number
          end_time: string
          id: string
          meeting_id: string | null
          mentee_id: string
          mentor_id: string
          notes: string | null
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          session_date: string
          specialty_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          duration_minutes: number
          end_time: string
          id?: string
          meeting_id?: string | null
          mentee_id: string
          mentor_id: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          session_date: string
          specialty_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          duration_minutes?: number
          end_time?: string
          id?: string
          meeting_id?: string | null
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          session_date?: string
          specialty_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "bookings_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_meeting"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_payment"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          external_calendar_id: string | null
          id: string
          is_active: boolean
          mentor_id: string
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          external_calendar_id?: string | null
          id?: string
          is_active?: boolean
          mentor_id: string
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          external_calendar_id?: string | null
          id?: string
          is_active?: boolean
          mentor_id?: string
          provider?: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "calendar_sync_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          created_at: string
          credential_url: string | null
          expires_at: string | null
          file_url: string | null
          id: string
          issued_at: string | null
          issuer: string
          mentor_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string | null
          issuer: string
          mentor_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string
          mentor_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "certificates_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          available_at: string | null
          booking_id: string
          created_at: string
          currency: string
          gross_amount: number
          id: string
          mentor_id: string
          net_amount: number
          payment_id: string
          platform_fee: number
          status: Database["public"]["Enums"]["earning_status"]
          updated_at: string
        }
        Insert: {
          available_at?: string | null
          booking_id: string
          created_at?: string
          currency?: string
          gross_amount: number
          id?: string
          mentor_id: string
          net_amount: number
          payment_id: string
          platform_fee: number
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
        }
        Update: {
          available_at?: string | null
          booking_id?: string
          created_at?: string
          currency?: string
          gross_amount?: number
          id?: string
          mentor_id?: string
          net_amount?: number
          payment_id?: string
          platform_fee?: number
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "earnings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          mentee_id: string
          mentor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "favorites_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "favorites_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_providers: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          id: string
          is_default: boolean
          is_enabled: boolean
          provider: Database["public"]["Enums"]["video_provider"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          provider: Database["public"]["Enums"]["video_provider"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          provider?: Database["public"]["Enums"]["video_provider"]
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          booking_id: string
          created_at: string
          end_time: string
          host_url: string | null
          id: string
          meeting_url: string
          password: string | null
          provider: Database["public"]["Enums"]["video_provider"]
          provider_meeting_id: string | null
          recording_url: string | null
          start_time: string
          status: Database["public"]["Enums"]["meeting_status"]
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          booking_id: string
          created_at?: string
          end_time: string
          host_url?: string | null
          id?: string
          meeting_url: string
          password?: string | null
          provider?: Database["public"]["Enums"]["video_provider"]
          provider_meeting_id?: string | null
          recording_url?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["meeting_status"]
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          booking_id?: string
          created_at?: string
          end_time?: string
          host_url?: string | null
          id?: string
          meeting_url?: string
          password?: string | null
          provider?: Database["public"]["Enums"]["video_provider"]
          provider_meeting_id?: string | null
          recording_url?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_specialties: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          specialty_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          specialty_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          specialty_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_specialties_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "mentor_specialties_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          average_rating: number
          cover_image_url: string | null
          created_at: string
          currency: string
          current_company: string | null
          current_title: string | null
          headline: string | null
          hourly_rate: number
          hyperpay_account_id: string | null
          id: string
          is_accepting_bookings: boolean
          is_featured: boolean
          is_verified: boolean
          languages: string[]
          profile_id: string
          stripe_account_id: string | null
          total_reviews: number
          total_sessions: number
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          average_rating?: number
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          current_company?: string | null
          current_title?: string | null
          headline?: string | null
          hourly_rate?: number
          hyperpay_account_id?: string | null
          id?: string
          is_accepting_bookings?: boolean
          is_featured?: boolean
          is_verified?: boolean
          languages?: string[]
          profile_id: string
          stripe_account_id?: string | null
          total_reviews?: number
          total_sessions?: number
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          average_rating?: number
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          current_company?: string | null
          current_title?: string | null
          headline?: string | null
          hourly_rate?: number
          hyperpay_account_id?: string | null
          id?: string
          is_accepting_bookings?: boolean
          is_featured?: boolean
          is_verified?: boolean
          languages?: string[]
          profile_id?: string
          stripe_account_id?: string | null
          total_reviews?: number
          total_sessions?: number
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "mentors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          invoice_url: string | null
          net_amount: number
          payee_id: string
          payer_id: string
          platform_fee: number
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id: string | null
          provider_response: Json | null
          refund_reason: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          invoice_url?: string | null
          net_amount: number
          payee_id: string
          payer_id: string
          platform_fee?: number
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string | null
          provider_response?: Json | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          invoice_url?: string | null
          net_amount?: number
          payee_id?: string
          payer_id?: string
          platform_fee?: number
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string | null
          provider_response?: Json | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          mentor_id: string
          payout_method: string
          processed_at: string | null
          reference_id: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          mentor_id: string
          payout_method: string
          processed_at?: string | null
          reference_id?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          mentor_id?: string
          payout_method?: string
          processed_at?: string | null
          reference_id?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "payouts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          email: string
          email_verified: boolean
          full_name: string | null
          id: string
          is_active: boolean
          linkedin_url: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email: string
          email_verified?: boolean
          full_name?: string | null
          id: string
          is_active?: boolean
          linkedin_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean
          full_name?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          is_public: boolean
          mentee_id: string
          mentor_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          mentee_id: string
          mentor_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          mentee_id?: string
          mentor_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "reviews_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "reviews_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          body: string
          created_at: string
          id: string
          priority: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          body: string
          created_at?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          body?: string
          created_at?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string
          currency: string
          id: string
          mentor_id: string
          processed_at: string | null
          provider_transfer_id: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string
          currency?: string
          id?: string
          mentor_id: string
          processed_at?: string | null
          provider_transfer_id?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string
          currency?: string
          id?: string
          mentor_id?: string
          processed_at?: string | null
          provider_transfer_id?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["mentor_id"]
          },
          {
            foreignKeyName: "withdrawals_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mentor_profiles: {
        // Note: hand-adjusted from the generated types. The view is an inner
        // JOIN on mentors/profiles NOT NULL primary keys, so every column
        // sourced from a NOT NULL base-table column is guaranteed present —
        // Postgres' own introspection can't see that through a view and
        // conservatively marks all columns nullable.
        Row: {
          avatar_url: string | null
          average_rating: number
          bio: string | null
          country: string | null
          cover_image_url: string | null
          currency: string
          current_company: string | null
          current_title: string | null
          email: string
          full_name: string | null
          headline: string | null
          hourly_rate: number
          is_accepting_bookings: boolean
          is_featured: boolean
          is_verified: boolean
          languages: string[]
          linkedin_url: string | null
          mentor_id: string
          profile_id: string
          total_reviews: number
          total_sessions: number
          years_experience: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_available_slots: {
        Args: { p_date: string; p_mentor_id: string }
        Returns: {
          is_available: boolean
          slot_time: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_mentor: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      calendar_provider: "google" | "outlook" | "apple"
      earning_status: "pending" | "available" | "withdrawn"
      meeting_status: "scheduled" | "started" | "completed" | "cancelled"
      notification_type:
        | "booking_confirmed"
        | "booking_cancelled"
        | "booking_reminder"
        | "payment_received"
        | "meeting_starting"
        | "review_request"
        | "message_received"
        | "payout_processed"
      payment_provider: "hyperpay" | "stripe"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "mentee" | "mentor" | "admin"
      video_provider: "zoom" | "teams" | "google_meet"
      withdrawal_status: "pending" | "processing" | "completed" | "failed"
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
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      calendar_provider: ["google", "outlook", "apple"],
      earning_status: ["pending", "available", "withdrawn"],
      meeting_status: ["scheduled", "started", "completed", "cancelled"],
      notification_type: [
        "booking_confirmed",
        "booking_cancelled",
        "booking_reminder",
        "payment_received",
        "meeting_starting",
        "review_request",
        "message_received",
        "payout_processed",
      ],
      payment_provider: ["hyperpay", "stripe"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: ["mentee", "mentor", "admin"],
      video_provider: ["zoom", "teams", "google_meet"],
      withdrawal_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Mentor = Database["public"]["Tables"]["mentors"]["Row"];
export type Specialty = Database["public"]["Tables"]["specialties"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Earning = Database["public"]["Tables"]["earnings"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MeetingProvider = Database["public"]["Tables"]["meeting_providers"]["Row"];

export type MentorProfile = Database["public"]["Views"]["mentor_profiles"]["Row"];

export type MentorWithProfile = Mentor & {
  profiles: Profile;
  specialties: Specialty[];
};

export type BookingWithDetails = Booking & {
  mentor: Profile & { mentors: Mentor };
  mentee: Profile;
  meeting: Meeting | null;
  payment: Payment | null;
  review: Review | null;
};
