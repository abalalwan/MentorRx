export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "mentee" | "mentor" | "admin";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type PaymentProvider = "hyperpay" | "stripe";
export type VideoProvider = "zoom" | "teams" | "google_meet";
export type MeetingStatus = "scheduled" | "started" | "completed" | "cancelled";
export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_reminder"
  | "payment_received"
  | "meeting_starting"
  | "review_request"
  | "message_received"
  | "payout_processed";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          phone: string | null;
          country: string | null;
          timezone: string | null;
          bio: string | null;
          linkedin_url: string | null;
          is_active: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      mentors: {
        Row: {
          id: string;
          profile_id: string;
          headline: string | null;
          current_company: string | null;
          current_title: string | null;
          years_experience: number | null;
          hourly_rate: number;
          currency: string;
          languages: string[];
          is_verified: boolean;
          is_featured: boolean;
          is_accepting_bookings: boolean;
          cover_image_url: string | null;
          total_sessions: number;
          total_reviews: number;
          average_rating: number;
          stripe_account_id: string | null;
          hyperpay_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["mentors"]["Row"], "created_at" | "updated_at" | "id" | "total_sessions" | "total_reviews" | "average_rating" | "is_verified" | "is_featured" | "is_accepting_bookings" | "cover_image_url" | "stripe_account_id" | "hyperpay_account_id"> & {
          id?: string;
          is_verified?: boolean;
          is_featured?: boolean;
          is_accepting_bookings?: boolean;
          cover_image_url?: string | null;
          stripe_account_id?: string | null;
          hyperpay_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
          total_sessions?: number;
          total_reviews?: number;
          average_rating?: number;
        };
        Update: Partial<Database["public"]["Tables"]["mentors"]["Insert"]>;
        Relationships: [];
      };
      specialties: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["specialties"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["specialties"]["Insert"]>;
        Relationships: [];
      };
      mentor_specialties: {
        Row: {
          id: string;
          mentor_id: string;
          specialty_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["mentor_specialties"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mentor_specialties"]["Insert"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          mentor_id: string;
          title: string;
          issuer: string;
          issued_at: string | null;
          expires_at: string | null;
          credential_url: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["certificates"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
        Relationships: [];
      };
      availability: {
        Row: {
          id: string;
          mentor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["availability"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          mentor_id: string;
          mentee_id: string;
          specialty_id: string | null;
          status: BookingStatus;
          session_date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          title: string | null;
          notes: string | null;
          amount: number;
          currency: string;
          payment_status: PaymentStatus;
          payment_id: string | null;
          meeting_id: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          mentee_id: string;
          specialty_id?: string | null;
          status?: BookingStatus;
          session_date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          title?: string | null;
          notes?: string | null;
          amount: number;
          currency: string;
          payment_status?: PaymentStatus;
          payment_id?: string | null;
          meeting_id?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          payer_id: string;
          payee_id: string;
          amount: number;
          currency: string;
          platform_fee: number;
          net_amount: number;
          status: PaymentStatus;
          provider: PaymentProvider;
          provider_payment_id: string | null;
          provider_response: Json | null;
          invoice_url: string | null;
          refunded_at: string | null;
          refund_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          booking_id: string;
          provider: VideoProvider;
          provider_meeting_id: string | null;
          meeting_url: string;
          host_url: string | null;
          password: string | null;
          status: MeetingStatus;
          start_time: string;
          end_time: string;
          actual_start_time: string | null;
          actual_end_time: string | null;
          recording_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["meetings"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["meetings"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          mentor_id: string;
          mentee_id: string;
          rating: number;
          comment: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          mentee_id: string;
          mentor_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["favorites"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      earnings: {
        Row: {
          id: string;
          mentor_id: string;
          booking_id: string;
          payment_id: string;
          gross_amount: number;
          platform_fee: number;
          net_amount: number;
          currency: string;
          status: "pending" | "available" | "withdrawn";
          available_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["earnings"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["earnings"]["Insert"]>;
        Relationships: [];
      };
      withdrawals: {
        Row: {
          id: string;
          mentor_id: string;
          amount: number;
          currency: string;
          status: "pending" | "processing" | "completed" | "failed";
          bank_details: Json | null;
          provider_transfer_id: string | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["withdrawals"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["withdrawals"]["Insert"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          booking_id: string | null;
          content: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          body: string;
          status: TicketStatus;
          priority: "low" | "medium" | "high" | "urgent";
          assigned_to: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["support_tickets"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Insert"]>;
        Relationships: [];
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admin_logs"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_logs"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
      calendar_sync: {
        Row: {
          id: string;
          mentor_id: string;
          provider: "google" | "outlook" | "apple";
          access_token: string | null;
          refresh_token: string | null;
          expires_at: string | null;
          external_calendar_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["calendar_sync"]["Row"], "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_sync"]["Insert"]>;
        Relationships: [];
      };
      payouts: {
        Row: {
          id: string;
          mentor_id: string;
          amount: number;
          currency: string;
          status: "pending" | "processing" | "completed" | "failed";
          payout_method: string;
          reference_id: string | null;
          requested_at: string;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          amount: number;
          currency: string;
          status?: "pending" | "processing" | "completed" | "failed";
          payout_method: string;
          reference_id?: string | null;
          requested_at?: string;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payouts"]["Insert"]>;
        Relationships: [];
      };
      availability_exceptions: {
        Row: {
          id: string;
          mentor_id: string;
          exception_date: string;
          is_available: boolean;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          exception_date: string;
          is_available?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability_exceptions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      mentor_profiles: {
        Row: {
          mentor_id: string;
          profile_id: string;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          country: string | null;
          languages: string[];
          bio: string | null;
          linkedin_url: string | null;
          headline: string | null;
          current_company: string | null;
          current_title: string | null;
          years_experience: number | null;
          hourly_rate: number;
          currency: string;
          is_verified: boolean;
          is_featured: boolean;
          is_accepting_bookings: boolean;
          cover_image_url: string | null;
          total_sessions: number;
          total_reviews: number;
          average_rating: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_mentor_availability: {
        Args: { p_mentor_id: string; p_date: string };
        Returns: { slot_time: string; is_available: boolean }[];
      };
    };
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      payment_provider: PaymentProvider;
      video_provider: VideoProvider;
      meeting_status: MeetingStatus;
      notification_type: NotificationType;
    };
  };
}

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
