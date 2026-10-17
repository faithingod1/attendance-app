# Complete Deployment Guide: Monthly Employee Attendance Record

This guide will walk you through setting up and deploying the web application from scratch.

---

## 📋 Prerequisites

Before starting, make sure you have:
- A GitHub account (free)
- A Vercel account (free - sign up at vercel.com)
- A Supabase account (free - sign up at supabase.com)
- Node.js installed on your computer (v18 or higher)

---

## Part 1: Set Up Supabase Database (Backend)

### Step 1.1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Click "New Project"
5. Fill in the details:
   - **Name:** `attendance-app` (or any name you prefer)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your location (e.g., Singapore for Malaysia)
   - **Pricing Plan:** Free tier is sufficient
6. Click "Create new project"
7. Wait 1-2 minutes for the project to be set up

### Step 1.2: Get Your API Keys

1. In your Supabase dashboard, click the **Settings** icon (gear) in the left sidebar
2. Click **API** in the settings menu
3. You'll need two values:
   - **Project URL:** Copy this (looks like `https://xxxxxx.supabase.co`)
   - **anon public key:** Copy this (long string starting with `eyJ...`)

### Step 1.3: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy and paste the entire SQL schema below:

```sql
-- ============================================
-- MONTHLY EMPLOYEE ATTENDANCE RECORD DATABASE
-- ============================================

-- 1. Employees table (name as primary key)
CREATE TABLE employees (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Attendance logs table
CREATE TABLE attendance_logs (
    employee_name TEXT REFERENCES employees(name) ON DELETE CASCADE ON UPDATE CASCADE,
    month_year TEXT,  -- Format: 'YYYY-MM' (e.g., '2026-10')
    day_date DATE,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'off')),
    clock_in TIME NULL,
    clock_out TIME NULL,
    keterangan TEXT NULL,
    PRIMARY KEY (employee_name, day_date)
);

-- 3. App settings table (for form lock and admin credentials)
CREATE TABLE app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    is_locked BOOLEAN DEFAULT FALSE,
    admin_username TEXT DEFAULT 'admin',
    admin_password TEXT DEFAULT 'admin123' CHECK (char_length(admin_password) >= 6)
);

-- Insert default app settings
INSERT INTO app_settings (id, is_locked, admin_username, admin_password) 
VALUES (1, FALSE, 'admin', 'admin123');

-- Create indexes for better performance
CREATE INDEX idx_attendance_logs_employee_month ON attendance_logs(employee_name, month_year);
CREATE INDEX idx_attendance_logs_date ON attendance_logs(day_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Employees table policies
CREATE POLICY "Allow public read on employees" 
ON employees FOR SELECT USING (true);

CREATE POLICY "Allow public insert on employees" 
ON employees FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on employees" 
ON employees FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on employees" 
ON employees FOR DELETE USING (true);

-- Attendance logs table policies
CREATE POLICY "Allow public read on attendance_logs" 
ON attendance_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert on attendance_logs" 
ON attendance_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on attendance_logs" 
ON attendance_logs FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on attendance_logs" 
ON attendance_logs FOR DELETE USING (true);

-- App settings table policies
CREATE POLICY "Allow public read on app_settings" 
ON app_settings FOR SELECT USING (true);

CREATE POLICY "Allow public update on app_settings" 
ON app_settings FOR UPDATE USING (true);

-- ============================================
-- OPTIONAL: Insert sample employees for testing
-- ============================================

INSERT INTO employees (name) VALUES 
('Ahmad bin Abu'),
('Siti binti Ali'),
('Kumar a/l Raju'),
('Lee Wei Ming'),
('Sarah Tan');
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned" - this is correct!

### Step 1.4: Verify Tables Created

1. Click **Table Editor** in the left sidebar
2. You should see three tables:
   - `employees` (5 sample employees if you ran the optional insert)
   - `attendance_logs` (empty)
   - `app_settings` (1 row with default admin credentials)

---

## Part 2: Configure Local Environment

### Step 2.1: Update Environment Variables

1. Open the `.env.local` file in your project
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Replace these with your actual values from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5NzU2NzgwMCwiZXhwIjoyMDEzMTQzODAwfQ.xxxxxxxxxxxxxxxxx
```

### Step 2.2: Test Locally

1. Open terminal/command prompt in your project folder
2. Run the development server:

```bash
npm run dev
```

3. Open browser and go to: `http://localhost:3000`
4. You should see the attendance form
5. Try selecting an employee and month
6. Test the admin panel at: `http://localhost:3000/admin`
   - Login: `admin` / `admin123`

---

## Part 3: Deploy to Vercel

### Step 3.1: Push to GitHub

1. Initialize git repository (if not already done):

```bash
git init
git add .
git commit -m "Initial commit: Monthly Employee Attendance Record"
```

2. Create a GitHub repository:
   - Go to [github.com](https://github.com)
   - Click "+" → "New repository"
   - Name it: `attendance-app`
   - Keep it Public (required for free Vercel deployment)
   - Don't initialize with README (we already have code)
   - Click "Create repository"

3. Push your code to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/attendance-app.git
git branch -M main
git push -u origin main
```

### Step 3.2: Connect to Vercel

**Option A: Via Vercel Website (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Add New..." → "Project"
5. Find your `attendance-app` repository and click "Import"
6. Configure the project:
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### Step 3.3: Add Environment Variables in Vercel

**This is crucial!** Before clicking Deploy:

1. Expand "Environment Variables" section
2. Add two variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase Project URL (e.g., `https://abcdefghij.supabase.co`)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key (the long string starting with `eyJ...`)

3. Click "Deploy"

### Step 3.4: Wait for Deployment

1. Vercel will build and deploy your app (takes 1-2 minutes)
2. You'll see build logs scrolling
3. When complete, you'll see confetti and a success message
4. Click "Continue to Dashboard"

### Step 3.5: Get Your Live URL

1. In Vercel dashboard, you'll see your deployment URL
2. It looks like: `https://attendance-app-xyz.vercel.app`
3. Click the URL to view your live application!

---

## Part 4: Post-Deployment Configuration

### Step 4.1: Change Admin Password (IMPORTANT!)

1. Visit your live site: `https://your-app.vercel.app/admin`
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Go to "Admin Settings" tab
4. Enter:
   - Current password: `admin123`
   - New username: (choose a secure username)
   - New password: (minimum 6 characters, use a strong password)
   - Confirm password: (same as new password)
5. Click "Submit"

### Step 4.2: Add Real Employees

1. In Admin Dashboard, go to "Employee Management"
2. Enter employee names one by one
3. Click "Add Employee" for each

### Step 4.3: Test the Application

**Employee Side:**
1. Go to home page (`/`)
2. Select an employee from dropdown
3. Select a month
4. Fill in attendance records
5. Click "Submit"

**Admin Side:**
1. Go to `/admin`
2. Login
3. Try toggling form lock
4. View attendance records
5. Delete a record (test feature)

---

## Part 5: Custom Domain (Optional)

### Step 5.1: Add Custom Domain in Vercel

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Enter your domain (e.g., `attendance.yourcompany.com`)
4. Follow Vercel's instructions to configure DNS

### Step 5.2: Configure DNS

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add CNAME record:
   - Name: `attendance` (or your subdomain)
   - Value: `cname.vercel-dns.com`
3. Wait for DNS propagation (up to 48 hours, usually faster)

---

## Part 6: Troubleshooting

### Problem: "Invalid supabaseUrl" Error

**Solution:**
- Check that `.env.local` has correct values
- Ensure no extra spaces or quotes around the URLs
- Verify the URL format: `https://xxxxx.supabase.co`

### Problem: Build Fails on Vercel

**Solution:**
- Check Vercel build logs for specific error
- Ensure environment variables are set in Vercel
- Try redeploying after adding environment variables

### Problem: "Failed to fetch data" in Browser

**Solution:**
- Verify Supabase project is not paused (free tier pauses after 1 week of inactivity)
- Check browser console for specific errors
- Ensure RLS policies are correctly set in Supabase

### Problem: Can't Login to Admin

**Solution:**
- Verify `app_settings` table has the default row
- Run this in Supabase SQL Editor:

```sql
SELECT * FROM app_settings;
```

If empty, run:
```sql
INSERT INTO app_settings (id, is_locked, admin_username, admin_password) 
VALUES (1, FALSE, 'admin', 'admin123');
```

---

## Part 7: Maintenance

### Updating the Application

1. Make changes to your local code
2. Test with `npm run dev`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
4. Vercel will automatically redeploy!

### Monitoring

- **Vercel Dashboard:** View deployment history, logs, analytics
- **Supabase Dashboard:** Monitor database usage, view logs

### Backup

- Supabase automatically backs up your database (daily on paid plans)
- For free tier, you can manually export data:
  1. Go to Supabase Dashboard → Database → Backups
  2. Or use SQL Editor to export as CSV

---

## Quick Reference

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123` (CHANGE THIS IMMEDIATELY!)

**Key URLs:**
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Your App: `https://your-app.vercel.app`

**Tech Stack:**
- Frontend: Next.js 14, React, Tailwind CSS
- Icons: Lucide React
- Backend: Supabase (PostgreSQL)
- Hosting: Vercel

---

## Support

If you encounter issues:
1. Check the browser console (F12 → Console tab)
2. Check Vercel deployment logs
3. Check Supabase logs (Dashboard → Logs)
4. Review the troubleshooting section above

---

**Congratulations!** 🎉 

Your Monthly Employee Attendance Record application is now live and ready to use!
