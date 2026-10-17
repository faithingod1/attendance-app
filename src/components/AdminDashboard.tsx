'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase, AttendanceLog } from '@/lib/supabase';
import { TranslationKey } from '@/lib/translations';
import { Loader2, Plus, Trash2, Lock, Unlock } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { logout, checkLockStatus } = useAdmin();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    checkLockStatus().then(setIsLocked);
  }, [checkLockStatus]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('adminDashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isLocked ? t('formLocked') : t('formUnlocked')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
          >
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLocked ? (
            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          ) : (
            <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('formLockStatus')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLocked ? t('formLocked') : t('formUnlocked')}
            </p>
          </div>
        </div>
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
        </span>
      </div>

      <AdminContent />
    </div>
  );
}

function AdminContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'employees' | 'records' | 'settings'>('employees');

  return (
    <>
      <div className="flex overflow-x-auto pb-2 gap-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'employees'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {t('employeeManagement')}
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'records'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {t('attendanceRecords')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {t('adminSettings')}
        </button>
      </div>

      {activeTab === 'employees' && <EmployeeManagement />}
      {activeTab === 'records' && <AttendanceRecords />}
      {activeTab === 'settings' && <AdminSettings />}
    </>
  );
}

function EmployeeManagement() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('name')
        .order('name', { ascending: true });

      if (error) throw error;
      setEmployees(data?.map(e => e.name) || []);
    } catch {
      console.error('Error fetching employees');
    }
  };

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newName.trim()) {
      setMessage({ type: 'error', text: t('required') });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .insert({ name: newName.trim() });

      if (error) throw error;

      setNewName('');
      setMessage({ type: 'success', text: t('employeeAdded') });
      fetchEmployees();
    } catch {
      setMessage({ type: 'error', text: 'Failed to add employee. They may already exist.' });
    } finally {
      setLoading(false);
    }
  };

  const removeEmployee = async (name: string) => {
    if (!confirm(t('confirmRemove'))) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('name', name);

      if (error) throw error;
      setMessage({ type: 'success', text: t('employeeRemoved') });
      fetchEmployees();
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove employee' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('addEmployee')}
        </h2>
        <form onSubmit={addEmployee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('employeeName')}
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder={t('employeeNamePlaceholder')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Plus className="w-4 h-4 inline mr-2" />}
            {t('addEmployee')}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {employees.length} {t('employeeManagement')}
        </h2>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No employees found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map((name) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-gray-900 dark:text-white font-medium">{name}</span>
                <button
                  onClick={() => removeEmployee(name)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                  title={t('removeEmployee')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceRecords() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [records, setRecords] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!selectedEmployee || !selectedMonth) return;
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('employee_name', selectedEmployee)
        .eq('month_year', selectedMonth)
        .order('day_date', { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch {
      setMessage({ type: 'error', text: t('fetchError') });
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, selectedMonth, t]);

  useEffect(() => {
    if (selectedEmployee && selectedMonth) {
      fetchRecords();
    }
  }, [selectedEmployee, selectedMonth, fetchRecords]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('name')
        .order('name', { ascending: true });
      if (error) throw error;
      setEmployees(data?.map(e => e.name) || []);
    } catch {
      console.error('Error fetching employees');
    }
  };

  const deleteRecord = async () => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('attendance_logs')
        .delete()
        .eq('employee_name', selectedEmployee)
        .eq('month_year', selectedMonth);

      if (error) throw error;
      setMessage({ type: 'success', text: t('recordDeleted') });
      setRecords([]);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete record' });
    }
  };

  const dayKeys: TranslationKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('employeeName')}
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('selectEmployeeToView')}</option>
            {employees.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('monthYear')}
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {selectedEmployee && selectedMonth && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedEmployee} - {selectedMonth}
            </h3>
            <button
              onClick={deleteRecord}
              disabled={records.length === 0}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              {t('deleteRecord')}
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No records found for {selectedEmployee} in {selectedMonth}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('day')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('clockIn')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('clockOut')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('remarks')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map((record) => {
                    const date = new Date(record.day_date);
                    return (
                      <tr key={record.day_date} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {t(dayKeys[date.getDay()])}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {record.day_date}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {record.status === 'present' ? t('present') : t('off')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {record.clock_in || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {record.clock_out || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {record.keterangan || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminSettings() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: 'error', text: t('passwordMinLength') });
      return;
    }

    if (newPassword !== confirmPassword && confirmPassword) {
      setMessage({ type: 'error', text: t('passwordMismatch') });
      return;
    }

    setLoading(true);

    try {
      const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('admin_password')
        .eq('id', 1)
        .single();

      if (settingsError) throw settingsError;

      if (currentPassword !== settings.admin_password) {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
        setLoading(false);
        return;
      }

      const updateData: { admin_username?: string; admin_password?: string } = {};

      if (newUsername) {
        updateData.admin_username = newUsername;
      }
      if (newPassword) {
        updateData.admin_password = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'No changes to save' });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('app_settings')
        .update(updateData)
        .eq('id', 1);

      if (error) throw error;

      setMessage({ type: 'success', text: t('credentialsUpdated') });
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to update credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {t('updateCredentials')}
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={updateCredentials} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('password')} (Current)
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('newUsername')}
          </label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={t('username')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('newPassword')}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={t('password')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('confirmPassword')}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={t('confirmPassword')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>
    </div>
  );
}
