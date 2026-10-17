'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function LockToggle() {
  const { t } = useLanguage();
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLockStatus();
  }, []);

  const fetchLockStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('is_locked')
        .eq('id', 1)
        .single();

      if (error) throw error;
      setIsLocked(data?.is_locked ?? false);
    } catch {
      console.error('Error fetching lock status');
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async () => {
    setUpdating(true);
    try {
      const newValue = !isLocked;
      const { error } = await supabase
        .from('app_settings')
        .update({ is_locked: newValue })
        .eq('id', 1);

      if (error) throw error;
      setIsLocked(newValue);
    } catch {
      console.error('Error updating lock status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
      <span className={`text-sm font-medium ${isLocked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {isLocked ? t('formLocked') : t('formUnlocked')}
      </span>
      <button
        onClick={toggleLock}
        disabled={updating}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isLocked
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {updating && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
        {t('toggleLock')}
      </button>
    </div>
  );
}
