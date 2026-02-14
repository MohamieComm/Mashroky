'use client';

import { useState } from 'react';
import { activitiesApi } from '@/lib/api-client';
import { Activity } from '@/lib/amadeus/types';
import { formatPrice, truncate } from '@/lib/utils';

type View = 'search' | 'results' | 'detail';

export default function ActivitiesPage() {
  const [view, setView] = useState<View>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(5);

  // Results
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);

  // Presets for popular GCC cities
  const presets = [
    { name: 'الرياض', lat: 24.7136, lng: 46.6753 },
    { name: 'جدة', lat: 21.5433, lng: 39.1728 },
    { name: 'دبي', lat: 25.2048, lng: 55.2708 },
    { name: 'أبوظبي', lat: 24.4539, lng: 54.3773 },
    { name: 'الدوحة', lat: 25.2854, lng: 51.531 },
    { name: 'المنامة', lat: 26.2285, lng: 50.586 },
    { name: 'مسقط', lat: 23.588, lng: 58.3829 },
    { name: 'الكويت', lat: 29.3759, lng: 47.9774 },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) return;
    setLoading(true);
    setError('');
    try {
      const res: any = await activitiesApi.search({
        latitude: latitude,
        longitude: longitude,
        radius: String(radius),
      });
      setActivities(res.data || []);
      setView('results');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (activityId: string) => {
    setLoading(true);
    try {
      const res: any = await activitiesApi.get(activityId);
      setSelected(res.data || null);
      setView('detail');
    } catch {
      // Fall back to list item
      setSelected(activities.find(a => a.id === activityId) || null);
      setView('detail');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white" dir="rtl">
      <div className="bg-gradient-to-l from-purple-900 to-purple-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">🎯 الأنشطة والتجارب</h1>
          <p className="text-purple-200 text-lg">اكتشف أفضل الأنشطة السياحية في وجهتك</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">⚠️ {error}</div>
        )}

        {/* Search */}
        {view === 'search' && (
          <div className="space-y-6">
            {/* Quick city picks */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold mb-4">🏙️ اختر مدينة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {presets.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      setLatitude(String(city.lat));
                      setLongitude(String(city.lng));
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      latitude === String(city.lat)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">خط العرض</label>
                  <input
                    type="number" step="any" required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">خط الطول</label>
                  <input
                    type="number" step="any" required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نطاق البحث (كم)</label>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    {[1, 2, 5, 10, 20, 50].map(n => <option key={n} value={n}>{n} كم</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-l from-purple-600 to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 text-lg">
                {loading ? 'جاري البحث...' : '🔍 بحث عن أنشطة'}
              </button>
            </form>
          </div>
        )}

        {/* Results */}
        {view === 'results' && (
          <div className="space-y-4">
            <button onClick={() => setView('search')} className="text-purple-700 hover:text-purple-900">→ تعديل البحث</button>
            <h2 className="text-xl font-bold">{activities.length} نشاط متاح</h2>

            {activities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <p className="text-xl text-gray-600">لم يتم العثور على أنشطة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {activity.pictures?.[0] && (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={activity.pictures[0]}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
                      {activity.shortDescription && (
                        <p className="text-sm text-gray-600 mb-3">{truncate(activity.shortDescription, 100)}</p>
                      )}
                      {activity.rating && (
                        <div className="text-sm text-yellow-600 mb-2">⭐ {activity.rating}</div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        {activity.price?.amount && (
                          <span className="text-lg font-bold text-purple-700">
                            {formatPrice(activity.price.amount, activity.price.currencyCode || 'SAR')}
                          </span>
                        )}
                        <button
                          onClick={() => handleViewDetail(activity.id)}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                        >
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail */}
        {view === 'detail' && selected && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <button onClick={() => setView('results')} className="p-4 text-purple-700 hover:text-purple-900">→ رجوع</button>
            {selected.pictures?.[0] && (
              <div className="h-64 bg-gray-200">
                <img src={selected.pictures[0]} alt={selected.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selected.name}</h2>
              {selected.rating && <div className="text-lg text-yellow-600 mb-3">⭐ {selected.rating}</div>}
              {selected.description && <p className="text-gray-700 mb-4 leading-relaxed">{selected.description}</p>}
              {selected.minimumDuration && <p className="text-sm text-gray-500 mb-2">⏱️ المدة: {selected.minimumDuration}</p>}
              {selected.price?.amount && (
                <div className="text-2xl font-bold text-purple-700 mb-4">
                  {formatPrice(selected.price.amount, selected.price.currencyCode || 'SAR')}
                </div>
              )}
              {selected.bookingLink && (
                <a
                  href={selected.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
                >
                  احجز الآن ←
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
