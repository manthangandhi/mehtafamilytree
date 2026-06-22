// =====================================================
// Minimal Database types for Digital Family Directory
// For production: run `npx supabase gen types typescript --linked > lib/supabase/database.types.ts`
// after connecting your Supabase project.
// Hand-maintained types for the app (run supabase gen types for production sync).
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          mobile_number: string | null;
          role: 'member' | 'admin';
          status: 'pending' | 'approved' | 'rejected' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          mobile_number?: string | null;
          role?: 'member' | 'admin';
          status?: 'pending' | 'approved' | 'rejected' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          mobile_number?: string | null;
          role?: 'member' | 'admin';
          status?: 'pending' | 'approved' | 'rejected' | 'blocked';
          updated_at?: string;
        };
      };
      households: {
        Row: {
          id: string;
          household_code: string | null;
          primary_member_name: string;
          primary_person_id: string | null;
          native_place: string | null;
          residence_address: string | null;
          business_address: string | null;
          phone_number: string | null;
          mobile_number: string | null;
          whatsapp_number: string | null;
          email: string | null;
          city: string | null;
          state: string | null;
          country: string;
          notes: string | null;
          anniversary_date: string | null;
          visibility_level: 'public' | 'members' | 'admin';
          status: 'active' | 'inactive';
          verified: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_code?: string | null;
          primary_member_name: string;
          primary_person_id?: string | null;
          native_place?: string | null;
          residence_address?: string | null;
          business_address?: string | null;
          phone_number?: string | null;
          mobile_number?: string | null;
          whatsapp_number?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          notes?: string | null;
          anniversary_date?: string | null;
          visibility_level?: 'public' | 'members' | 'admin';
          status?: 'active' | 'inactive';
          verified?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          household_code?: string | null;
          primary_member_name?: string;
          primary_person_id?: string | null;
          native_place?: string | null;
          residence_address?: string | null;
          business_address?: string | null;
          phone_number?: string | null;
          mobile_number?: string | null;
          whatsapp_number?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          notes?: string | null;
          anniversary_date?: string | null;
          visibility_level?: 'public' | 'members' | 'admin';
          status?: 'active' | 'inactive';
          verified?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      persons: {
        Row: {
          id: string;
          full_name: string;
          gender: 'male' | 'female' | 'other' | null;
          date_of_birth: string | null;
          date_of_death: string | null;
          is_deceased: boolean;
          education: string | null;
          occupation: string | null;
          marital_status: string | null;
          mobile_number: string | null;
          whatsapp_number: string | null;
          email: string | null;
          blood_group: string | null;
          avatar_url: string | null;
          notes: string | null;
          visibility_level: 'public' | 'members' | 'admin';
          status: 'active' | 'inactive';
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          gender?: 'male' | 'female' | 'other' | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          is_deceased?: boolean;
          education?: string | null;
          occupation?: string | null;
          marital_status?: string | null;
          mobile_number?: string | null;
          whatsapp_number?: string | null;
          email?: string | null;
          blood_group?: string | null;
          avatar_url?: string | null;
          notes?: string | null;
          visibility_level?: 'public' | 'members' | 'admin';
          status?: 'active' | 'inactive';
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          gender?: 'male' | 'female' | 'other' | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          is_deceased?: boolean;
          education?: string | null;
          occupation?: string | null;
          marital_status?: string | null;
          mobile_number?: string | null;
          whatsapp_number?: string | null;
          email?: string | null;
          blood_group?: string | null;
          avatar_url?: string | null;
          notes?: string | null;
          visibility_level?: 'public' | 'members' | 'admin';
          status?: 'active' | 'inactive';
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          person_id: string;
          relationship_to_head: string;
          display_order: number;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          person_id: string;
          relationship_to_head: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          relationship_to_head?: string;
          display_order?: number;
          is_primary?: boolean;
          updated_at?: string;
        };
      };
      relationships: {
        Row: {
          id: string;
          person_id: string;
          related_person_id: string;
          relationship_type: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          related_person_id: string;
          relationship_type: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          relationship_type?: string;
          notes?: string | null;
        };
      };
      change_requests: {
        Row: {
          id: string;
          request_type: string;
          target_table: string;
          target_record_id: string | null;
          submitted_by: string;
          status: 'pending' | 'approved' | 'rejected';
          proposed_data: Json;
          current_data: Json | null;
          admin_notes: string | null;
          rejection_reason: string | null;
          reviewed_by: string | null;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          request_type: string;
          target_table: string;
          target_record_id?: string | null;
          submitted_by: string;
          status?: 'pending' | 'approved' | 'rejected';
          proposed_data: Json;
          current_data?: Json | null;
          admin_notes?: string | null;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          proposed_data?: Json;
          current_data?: Json | null;
          admin_notes?: string | null;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          action_type: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          performed_by: string | null;
          performed_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          action_type: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          performed_by?: string | null;
          performed_at?: string;
          notes?: string | null;
        };
        Update: never;
      };
      cultural_pages: {
        Row: {
          id: string;
          title: string;
          content: string;
          language: string;
          visibility_level: 'public' | 'members' | 'admin';
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          language?: string;
          visibility_level?: 'public' | 'members' | 'admin';
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          language?: string;
          visibility_level?: 'public' | 'members' | 'admin';
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          event_type: 'birth' | 'marriage' | 'passing' | 'general' | 'reunion';
          event_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          event_type: 'birth' | 'marriage' | 'passing' | 'general' | 'reunion';
          event_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          event_type?: 'birth' | 'marriage' | 'passing' | 'general' | 'reunion';
          event_date?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      public_households_view: {
        Row: {
          id: string;
          household_code: string | null;
          primary_member_name: string;
          native_place: string | null;
          city: string | null;
          state: string | null;
          country: string;
          verified: boolean;
          status: string;
          created_at: string;
        };
      };
      public_persons_view: {
        Row: {
          id: string;
          full_name: string;
          gender: string | null;
          date_of_birth: string | null;
          is_deceased: boolean;
          education: string | null;
          marital_status: string | null;
          status: string;
        };
      };
      member_households_view: {
        Row: Database['public']['Tables']['households']['Row'];
      };
      member_persons_view: {
        Row: Database['public']['Tables']['persons']['Row'];
      };
      member_household_members_view: {
        Row: Database['public']['Tables']['household_members']['Row'] & {
          full_name: string;
          gender: string | null;
          date_of_birth: string | null;
          is_deceased: boolean;
          education: string | null;
          marital_status: string | null;
          mobile_number: string | null;
          whatsapp_number: string | null;
          email: string | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
