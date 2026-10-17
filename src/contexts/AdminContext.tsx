'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkLockStatus: () => Promise<boolean>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('admin_username, admin_password')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data.admin_username === username && data.admin_password === password) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const checkLockStatus = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('is_locked')
        .eq('id', 1)
        .single();

      if (error) throw error;
      return data?.is_locked ?? false;
    } catch {
      return false;
    }
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout, checkLockStatus, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
