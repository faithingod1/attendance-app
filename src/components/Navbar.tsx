'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Attendance<span className="text-blue-600">Track</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              {t('home')}
            </Link>
            <Link
              href="/admin"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              {t('admin')}
            </Link>
          </div>
          <LanguageToggle />
        </div>
        <div className="flex md:hidden items-center gap-6 pb-3 pt-1 -mt-2">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium">
            {t('home')}
          </Link>
          <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium">
            {t('admin')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
