'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import Navbar from '@/components/Navbar';
import AttendanceForm from '@/components/AttendanceForm';
import { AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const { checkLockStatus } = useAdmin();
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLockStatus = async () => {
      const locked = await checkLockStatus();
      setIsLocked(locked);
      setLoading(false);
    };
    fetchLockStatus();
  }, [checkLockStatus]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('attendanceForm')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {isLocked 
                ? t('formLockedMessage') 
                : 'Select your name and month to view or update your attendance record'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600 dark:text-gray-400">{t('loading')}</div>
            </div>
          ) : isLocked ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                      {t('attendanceFormLocked')}
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {t('formLockedMessage')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
              <AttendanceForm isLocked={isLocked} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
