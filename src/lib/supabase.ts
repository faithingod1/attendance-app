import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Employee {
  name: string;
  created_at: string;
}

export interface AttendanceLog {
  employee_name: string;
  month_year: string;
  day_date: string;
  status: 'present' | 'off';
  clock_in: string | null;
  clock_out: string | null;
  keterangan: string | null;
}

export interface AppSettings {
  id: number;
  is_locked: boolean;
  admin_username: string;
  admin_password: string;
}
