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
          email: string;
          full_name: string;
          role: 'admin' | 'client';
          company: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'client';
          company?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'client';
          company?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          platform: 'google' | 'facebook' | 'instagram' | 'linkedin' | 'twitter';
          status: 'draft' | 'pending' | 'running' | 'paused' | 'completed';
          budget: number;
          spent: number;
          impressions: number;
          clicks: number;
          conversions: number;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          platform?: 'google' | 'facebook' | 'instagram' | 'linkedin' | 'twitter';
          status?: 'draft' | 'pending' | 'running' | 'paused' | 'completed';
          budget?: number;
          spent?: number;
          impressions?: number;
          clicks?: number;
          conversions?: number;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          name?: string;
          platform?: 'google' | 'facebook' | 'instagram' | 'linkedin' | 'twitter';
          status?: 'draft' | 'pending' | 'running' | 'paused' | 'completed';
          budget?: number;
          spent?: number;
          impressions?: number;
          clicks?: number;
          conversions?: number;
          start_date?: string | null;
          end_date?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          method: 'razorpay' | 'bank_transfer' | 'upi';
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          method?: 'razorpay' | 'bank_transfer' | 'upi';
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          amount?: number;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          method?: 'razorpay' | 'bank_transfer' | 'upi';
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          description?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          subject: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          subject: string;
          body: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          sender_id?: string;
          receiver_id?: string;
          subject?: string;
          body?: string;
          is_read?: boolean;
        };
      };
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
