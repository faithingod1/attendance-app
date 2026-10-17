# Monthly Employee Attendance Record - Database Setup

To deploy this application, you need to create the database schema in your Supabase project.

## Step 1: Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (choose any organization and name)
3. Note down your Project URL and anon/public key from Settings > API

## Step 2: Configure Environment Variables
Copy the following to your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 3: Execute SQL Schema
Run the following SQL commands in your Supabase SQL editor (Dashboard > SQL Editor):

```sql
-- Enable realtime for tables (optional but recommended)
alter publication supabase_realtime add table employees;
alter publication supabase_realtime add table attendance_logs;
alter publication supabase_realtime add table app_settings;

-- 1. Employees table (name as primary key)
CREATE TABLE employees (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Attendance logs table
CREATE TABLE attendance_logs (
    employee_name TEXT REFERENCES employees(name) ON DELETE CASCADE ON UPDATE CASCADE,
    month_year TEXT,  -- Format: 'YYYY-MM'
    day_date DATE,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'off')),
    clock_in TIME NULL,
    clock_out TIME NULL,
    keterangan TEXT NULL,
    PRIMARY KEY (employee_name, day_date)
);

-- 3. App settings table
CREATE TABLE app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    is_locked BOOLEAN DEFAULT FALSE,
    admin_username TEXT DEFAULT 'admin',
    admin_password TEXT DEFAULT 'admin123' CHECK (char_length(admin_password) >= 6)
);

-- Insert default app settings record
INSERT INTO app_settings (id, is_locked, admin_username, admin_password) 
VALUES (1, FALSE, 'admin', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_attendance_logs_employee_month ON attendance_logs(employee_name, month_year);
CREATE INDEX idx_attendance_logs_date ON attendance_logs(day_date);

-- Enable Row Level Security (RLS) - Optional for added security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security needs)
-- For this application, we'll allow public read/write since it relies on app_settings.is_locked
CREATE POLICY "Allow public read on employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert on employees" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on employees" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on employees" ON employees FOR DELETE USING (true);

CREATE POLICY "Allow public read on attendance_logs" ON attendance_logs FOR SELECT USING (true);
CREATE POLICY "Allow public upsert on attendance_logs" ON attendance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on attendance_logs" ON attendance_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on attendance_logs" ON attendance_logs FOR DELETE USING (true);

CREATE POLICY "Allow public read on app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update on app_settings" ON app_settings FOR UPDATE USING (true);
```

## Default Admin Credentials
- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Please change the admin password immediately after first login!

## Features Implemented
✅ Dual-language support (Bahasa Melayu & English)
✅ Mobile-first responsive design
✅ Employee selection from database
✅ Month/year picker
✅ Auto-generation of daily records
✅ Smart form logic (disable times when off)
✅ Bulk upsert for efficient saving
✅ Form locking mechanism
✅ Admin dashboard with authentication
✅ Employee management (add/remove)
✅ Attendance records viewing/editing
✅ Admin credentials update
✅ Loading states and error handling
✅ Success/feedback messages