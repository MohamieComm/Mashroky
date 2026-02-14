'use client';

import { useState } from 'react';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightResultsList from '@/components/flights/FlightResultsList';
import FlightBookingForm from '@/components/flights/FlightBookingForm';
import { FlightOffer, FlightSearchParams, Traveler } from '@/lib/amadeus/types';
import { flightsApi } from '@/lib/api-client';

type View = 'search' | 'results' | 'booking' | 'confirmation';

export default function FlightsPage() {
  const [view, setView] = useState<View>('search');
  const [searchLoading, setSearchLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [results, setResults] = useState<FlightOffer[]>([]);
  const [dictionaries, setDictionaries] = useState<Record<string, Record<string, string>>>({});
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (params: FlightSearchParams) => {
    setSearchLoading(true);
    setError('');
    try {
      const res: any = await flightsApi.search(params);
      setResults(res.data || []);
      setDictionaries(res.dictionaries || {});
      setView('results');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء البحث');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelect = async (offer: FlightOffer) => {
    // Price the offer first
    try {
      setSearchLoading(true);
      const priced: any = await flightsApi.pricing({
        type: 'flight-offers-pricing',
        flightOffers: [offer],
      });
      const pricedOffer = priced.data?.flightOffers?.[0] || offer;
      setSelectedOffer(pricedOffer);
      setView('booking');
    } catch {
      // If pricing fails, use original offer
      setSelectedOffer(offer);
      setView('booking');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBook = async (travelers: Traveler[]) => {
    if (!selectedOffer) return;
    setBookingLoading(true);
    setError('');
    try {
      const res = await flightsApi.book({
        data: {
          type: 'flight-order',
          flightOffers: [selectedOffer],
          travelers,
          ticketingAgreement: { option: 'DELAY_TO_QUEUE', dateTime: '' },
        },
      });
      setBookingResult(res);
      setView('confirmation');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحجز');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-900 to-blue-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">✈️ حجز الرحلات</h1>
          <p className="text-blue-200 text-lg">ابحث عن أفضل العروض من شركات الطيران العالمية</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Search View */}
        {view === 'search' && (
          <FlightSearchForm onSearch={handleSearch} loading={searchLoading} />
        )}

        {/* Results View */}
        {view === 'results' && (
          <div className="space-y-4">
            <button
              onClick={() => setView('search')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
            >
              → تعديل البحث
            </button>
            <FlightResultsList
              offers={results}
              onSelect={handleSelect}
              dictionaries={dictionaries}
            />
          </div>
        )}

        {/* Booking View */}
        {view === 'booking' && selectedOffer && (
          <FlightBookingForm
            offer={selectedOffer}
            onBook={handleBook}
            onBack={() => setView('results')}
            loading={bookingLoading}
          />
        )}

        {/* Confirmation View */}
        {view === 'confirmation' && bookingResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">تم الحجز بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              رقم الحجز: <span className="font-mono font-bold text-lg">{bookingResult.data?.id || 'N/A'}</span>
            </p>
            {bookingResult.data?.associatedRecords?.map((rec: any, i: number) => (
              <div key={i} className="text-sm text-gray-500">
                رقم التأكيد: {rec.reference}
              </div>
            ))}
            <button
              onClick={() => {
                setView('search');
                setResults([]);
                setSelectedOffer(null);
                setBookingResult(null);
              }}
              className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              بحث جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
