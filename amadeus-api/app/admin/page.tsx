'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

type Tab = 'overview' | 'bookings' | 'users' | 'logs' | 'config';

interface Stats {
  totalBookings: number;
  bookingsByType: Record<string, number>;
  bookingsByStatus: Record<string, number>;
  totalRevenue: number;
  totalUsers: number;
  adminUsers: number;
  apiCalls: number;
  avgResponseTime: number;
  errorRate: number;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // In production, get token from auth context
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
    'Content-Type': 'application/json',
  });

  const fetchData = async (endpoint: string) => {
    const res = await fetch(`/api/admin/${endpoint}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  };

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const loadTab = async (t: Tab) => {
    setLoading(true);
    setError('');
    try {
      switch (t) {
        case 'overview':
          const statsRes = await fetchData('stats');
          setStats(statsRes.data);
          break;
        case 'bookings':
          const bookingsRes = await fetchData('bookings');
          setBookings(bookingsRes.data || []);
          break;
        case 'users':
          const usersRes = await fetchData('users');
          setUsers(usersRes.data || []);
          break;
        case 'logs':
          const logsRes = await fetchData('logs');
          setLogs(logsRes.data || []);
          break;
        case 'config':
          const configRes = await fetchData('config');
          setConfig(configRes.data || {});
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, newRole }),
      });
      loadTab('users');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveConfig = async () => {
    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(config),
      });
      alert('تم حفظ الإعدادات بنجاح');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'bookings', label: 'الحجوزات', icon: '📋' },
    { id: 'users', label: 'المستخدمين', icon: '👥' },
    { id: 'logs', label: 'سجل API', icon: '📝' },
    { id: 'config', label: 'الإعدادات', icon: '⚙️' },
  ];

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    failed: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'مؤكد',
    pending: 'قيد الانتظار',
    cancelled: 'ملغي',
    failed: 'فشل',
  };

  const typeLabels: Record<string, string> = {
    flight: '✈️ طيران',
    hotel: '🏨 فندق',
    transfer: '🚗 نقل',
    activity: '🎯 نشاط',
  };

  const roleLabels: Record<string, string> = {
    user: 'مستخدم',
    admin: 'مشرف',
    super_admin: 'مشرف عام',
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-gray-900 to-gray-800 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">🛡️ لوحة التحكم — مشروك</h1>
          <p className="text-gray-400 text-sm mt-1">إدارة الحجوزات والمستخدمين و Amadeus API</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">⚠️ {error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-gray-800" />
          </div>
        )}

        {/* ── Overview ── */}
        {!loading && tab === 'overview' && stats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-5">
                <div className="text-sm text-gray-500 mb-1">إجمالي الحجوزات</div>
                <div className="text-3xl font-bold">{stats.totalBookings}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="text-sm text-gray-500 mb-1">الإيرادات</div>
                <div className="text-3xl font-bold text-green-700">{formatPrice(stats.totalRevenue)}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="text-sm text-gray-500 mb-1">المستخدمين</div>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="text-sm text-gray-500 mb-1">استدعاءات API</div>
                <div className="text-3xl font-bold">{stats.apiCalls}</div>
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-5">
                <div className="text-sm text-gray-500 mb-1">متوسط وقت الاستجابة</div>
                <div className="text-2xl font-bold">{stats.avgResponseTime} ms</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="text-sm text-gray-500 mb-1">نسبة الأخطاء</div>
                <div className={`text-2xl font-bold ${stats.errorRate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.errorRate}%
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <div className="text-sm text-gray-500 mb-1">المشرفين</div>
                <div className="text-2xl font-bold">{stats.adminUsers}</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-bold mb-3">حسب النوع</h3>
                {Object.entries(stats.bookingsByType).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1">
                    <span>{typeLabels[k] || k}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-bold mb-3">حسب الحالة</h3>
                {Object.entries(stats.bookingsByStatus).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[k] || ''}`}>
                      {statusLabels[k] || k}
                    </span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Bookings ── */}
        {!loading && tab === 'bookings' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right">رقم الحجز</th>
                    <th className="px-4 py-3 text-right">النوع</th>
                    <th className="px-4 py-3 text-right">المستخدم</th>
                    <th className="px-4 py-3 text-right">المبلغ</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                    <th className="px-4 py-3 text-right">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{b.id.substring(0, 8)}</td>
                      <td className="px-4 py-3">{typeLabels[b.booking_type] || b.booking_type}</td>
                      <td className="px-4 py-3">{b.profiles?.full_name || b.profiles?.email || 'مجهول'}</td>
                      <td className="px-4 py-3 font-bold">
                        {b.total_amount ? formatPrice(b.total_amount, b.currency) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[b.status] || ''}`}>
                          {statusLabels[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(b.created_at).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا توجد حجوزات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {!loading && tab === 'users' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right">الاسم</th>
                    <th className="px-4 py-3 text-right">البريد</th>
                    <th className="px-4 py-3 text-right">الدور</th>
                    <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
                    <th className="px-4 py-3 text-right">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{u.full_name || '—'}</td>
                      <td className="px-4 py-3 text-sm" dir="ltr">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="user">مستخدم</option>
                          <option value="admin">مشرف</option>
                          <option value="super_admin">مشرف عام</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── API Logs ── */}
        {!loading && tab === 'logs' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right">الوقت</th>
                    <th className="px-4 py-3 text-right">الطريقة</th>
                    <th className="px-4 py-3 text-right">النقطة</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                    <th className="px-4 py-3 text-right">الزمن</th>
                    <th className="px-4 py-3 text-right">خطأ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString('ar-SA')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                          log.method === 'GET' ? 'bg-green-100 text-green-700' :
                          log.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          log.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100'
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" dir="ltr">{log.endpoint}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs ${
                          (log.response_status || 0) < 400 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {log.response_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{log.response_time_ms}ms</td>
                      <td className="px-4 py-3 text-xs text-red-500 max-w-[200px] truncate">
                        {log.error_message || '—'}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا توجد سجلات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Config ── */}
        {!loading && tab === 'config' && config && (
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h3 className="text-xl font-bold">⚙️ إعدادات Amadeus API</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={config.client_id || ''}
                  onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <input
                  type="password"
                  value={config.client_secret || ''}
                  onChange={(e) => setConfig({ ...config, client_secret: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  type="url"
                  value={config.base_url || 'https://test.api.amadeus.com'}
                  onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <h4 className="font-bold mt-4">تفعيل / تعطيل الخدمات</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { key: 'flights_enabled', label: '✈️ الرحلات' },
                { key: 'hotels_enabled', label: '🏨 الفنادق' },
                { key: 'transfers_enabled', label: '🚗 النقل' },
                { key: 'activities_enabled', label: '🎯 الأنشطة' },
                { key: 'analytics_enabled', label: '📊 التحليلات' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[key] !== false}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={saveConfig}
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800"
            >
              💾 حفظ الإعدادات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
