'use client';

import { useState } from 'react';
import AirportSearch from './AirportSearch';
import { FlightSearchParams, CabinType } from '@/lib/amadeus/types';

interface Props {
  onSearch: (params: FlightSearchParams) => void;
  loading: boolean;
}

export default function FlightSearchForm({ onSearch, loading }: Props) {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState<CabinType>('ECONOMY');
  const [nonStop, setNonStop] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;

    const params: FlightSearchParams = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      travelClass,
      nonStop,
      currencyCode: 'SAR',
      max: 50,
    };

    if (children > 0) params.children = children;
    if (infants > 0) params.infants = infants;
    if (tripType === 'roundtrip' && returnDate) params.returnDate = returnDate;

    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-6" dir="rtl">
      {/* Trip Type */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={tripType === 'roundtrip'}
            onChange={() => setTripType('roundtrip')}
            className="text-blue-600"
          />
          <span>ذهاب وعودة</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={tripType === 'oneway'}
            onChange={() => setTripType('oneway')}
            className="text-blue-600"
          />
          <span>ذهاب فقط</span>
        </label>
      </div>

      {/* Origin / Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AirportSearch
          label="من"
          placeholder="مطار المغادرة"
          value={origin}
          onChange={(code) => setOrigin(code)}
        />
        <AirportSearch
          label="إلى"
          placeholder="مطار الوصول"
          value={destination}
          onChange={(code) => setDestination(code)}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ المغادرة</label>
          <input
            type="date"
            required
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {tripType === 'roundtrip' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ العودة</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Passengers & Class */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">بالغين</label>
          <select
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">أطفال</label>
          <select
            value={children}
            onChange={(e) => setChildren(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رضع</label>
          <select
            value={infants}
            onChange={(e) => setInfants(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {[0, 1, 2].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة</label>
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value as CabinType)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ECONOMY">اقتصادية</option>
            <option value="PREMIUM_ECONOMY">اقتصادية مميزة</option>
            <option value="BUSINESS">رجال الأعمال</option>
            <option value="FIRST">الدرجة الأولى</option>
          </select>
        </div>
      </div>

      {/* Non-stop filter */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={nonStop}
          onChange={(e) => setNonStop(e.target.checked)}
          className="rounded text-blue-600"
        />
        <span className="text-sm">رحلات مباشرة فقط</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !origin || !destination || !departureDate}
        className="w-full py-4 bg-gradient-to-l from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
            جاري البحث...
          </span>
        ) : (
          '🔍 بحث عن رحلات'
        )}
      </button>
    </form>
  );
}
