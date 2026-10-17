'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { TranslationKey } from '@/lib/translations';
import { Loader2, AlertCircle } from 'lucide-react';

interface AttendanceFormProps {
  isLocked: boolean;
}

interface DayRecord {
  day_date: string;
  status: 'present' | 'off';
  clock_in: string;
  clock_out: string;
  keterangan: string;
}

export default function AttendanceForm({ isLocked }: AttendanceFormProps) {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getDaysInMonth = (monthYear: string) => {
    const [year, month] = monthYear.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const fetchAttendanceRecords = useCallback(async () => {
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

      const daysInMonth = getDaysInMonth(selectedMonth);
      const [year, month] = selectedMonth.split('-');

      if (data && data.length > 0) {
        const recordMap = new Map(data.map(r => [r.day_date, r]));
        const completeRecords: DayRecord[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
          const existingRecord = recordMap.get(dateStr);
          
          if (existingRecord) {
            completeRecords.push({
              day_date: existingRecord.day_date,
              status: existingRecord.status,
              clock_in: existingRecord.clock_in || '09:00',
              clock_out: existingRecord.clock_out || '18:00',
              keterangan: existingRecord.keterangan || '',
            });
          } else {
            completeRecords.push({
              day_date: dateStr,
              status: 'present',
              clock_in: '09:00',
              clock_out: '18:00',
              keterangan: '',
            });
          }
        }
        setRecords(completeRecords);
      } else {
        const newRecords: DayRecord[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
          newRecords.push({
            day_date: dateStr,
            status: 'present',
            clock_in: '09:00',
            clock_out: '18:00',
            keterangan: '',
          });
        }
        setRecords(newRecords);
      }
    } catch {
      setMessage({ type: 'error', text: t('fetchError') });
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, selectedMonth, t]);

  useEffect(() => {
    if (selectedEmployee && selectedMonth) {
      fetchAttendanceRecords();
    }
  }, [selectedEmployee, selectedMonth, fetchAttendanceRecords]);

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

  const updateRecord = (index: number, field: keyof DayRecord, value: string) => {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'status' && value === 'off') {
      updated[index].clock_in = '';
      updated[index].clock_out = '';
    }
    
    if (field === 'status' && value === 'present') {
      updated[index].clock_in = '09:00';
      updated[index].clock_out = '18:00';
    }
    
    setRecords(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      setMessage({ type: 'error', text: t('selectEmployeeFirst') });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const recordsToUpsert = records.map(record => ({
        employee_name: selectedEmployee,
        month_year: selectedMonth,
        day_date: record.day_date,
        status: record.status,
        clock_in: record.status === 'present' ? record.clock_in : null,
        clock_out: record.status === 'present' ? record.clock_out : null,
        keterangan: record.keterangan || null,
      }));

      const { error } = await supabase
        .from('attendance_logs')
        .upsert(recordsToUpsert, {
          onConflict: 'employee_name,day_date',
        });

      if (error) throw error;
      setMessage({ type: 'success', text: t('savedSuccessfully') });
    } catch {
      setMessage({ type: 'error', text: t('saveError') });
    } finally {
      setSaving(false);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayKeys: TranslationKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(dayKeys[date.getDay()]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  if (isLocked) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('employeeName')} *
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">{t('selectEmployee')}</option>
            {employees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('monthYear')} *
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading')}</span>
        </div>
      )}

      {!loading && selectedEmployee && records.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('day')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('clockIn')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('clockOut')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('remarks')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((record, index) => (
                  <tr key={record.day_date} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {getDayName(record.day_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {formatDate(record.day_date)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={record.status}
                        onChange={(e) => updateRecord(index, 'status', e.target.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                          record.status === 'present'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="present">{t('present')}</option>
                        <option value="off">{t('off')}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={record.clock_in}
                        onChange={(e) => updateRecord(index, 'clock_in', e.target.value)}
                        disabled={record.status === 'off'}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                          record.status === 'off'
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={record.clock_out}
                        onChange={(e) => updateRecord(index, 'clock_out', e.target.value)}
                        disabled={record.status === 'off'}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                          record.status === 'off'
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={record.keterangan}
                        onChange={(e) => updateRecord(index, 'keterangan', e.target.value)}
                        placeholder={t('remarks')}
                        className="w-full px-3 py-1.5 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {records.map((record, index) => (
              <div
                key={record.day_date}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getDayName(record.day_date)}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(record.day_date)}
                    </div>
                  </div>
                  <select
                    value={record.status}
                    onChange={(e) => updateRecord(index, 'status', e.target.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      record.status === 'present'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="present">{t('present')}</option>
                    <option value="off">{t('off')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('clockIn')}
                    </label>
                    <input
                      type="time"
                      value={record.clock_in}
                      onChange={(e) => updateRecord(index, 'clock_in', e.target.value)}
                      disabled={record.status === 'off'}
                      className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                        record.status === 'off'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('clockOut')}
                    </label>
                    <input
                      type="time"
                      value={record.clock_out}
                      onChange={(e) => updateRecord(index, 'clock_out', e.target.value)}
                      disabled={record.status === 'off'}
                      className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                        record.status === 'off'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('remarks')}
                  </label>
                  <input
                    type="text"
                    value={record.keterangan}
                    onChange={(e) => updateRecord(index, 'keterangan', e.target.value)}
                    placeholder={t('remarks')}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => fetchAttendanceRecords()}
              className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              {t('reset')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  {t('saving')}
                </>
              ) : (
                t('submit')
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
