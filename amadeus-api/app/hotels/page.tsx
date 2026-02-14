'use client';

import { useState } from 'react';
import { hotelsApi } from '@/lib/api-client';
import { Hotel, HotelOffers, HotelOffer, BoardType } from '@/lib/amadeus/types';
import { formatPrice } from '@/lib/utils';

type View = 'search' | 'hotels' | 'offers' | 'booking' | 'confirmation';

const BOARD_LABELS: Record<string, string> = {
  ROOM_ONLY: 'غرفة فقط',
  BREAKFAST: 'إفطار',
  HALF_BOARD: 'نصف إقامة',
  FULL_BOARD: 'إقامة كاملة',
  ALL_INCLUSIVE: 'شامل الجميع',
};

export default function HotelsPage() {
  const [view, setView] = useState<View>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search
  const [cityCode, setCityCode] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [rooms, setRooms] = useState(1);

  // Results
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelOffers, setHotelOffers] = useState<HotelOffers[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<{ hotel: any; offer: HotelOffer } | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Booking form
  const [guestName, setGuestName] = useState({ firstName: '', lastName: '' });
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const handleSearchHotels = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityCode) return;
    setLoading(true);
    setError('');
    try {
      const res: any = await hotelsApi.searchByCity({ cityCode });
      setHotels(res.data || []);
      setView('hotels');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOffers = async (hotelIds: string[]) => {
    setLoading(true);
    setError('');
    try {
      const res: any = await hotelsApi.searchOffers({
        hotelIds: hotelIds.slice(0, 20), // max 20
        adults,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomQuantity: rooms,
        currency: 'SAR',
        bestRateOnly: true,
      });
      setHotelOffers(res.data || []);
      setView('offers');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    setLoading(true);
    setError('');
    try {
      const res = await hotelsApi.book({
        data: {
          type: 'hotel-order',
          guests: [{
            tid: 1,
            title: 'MR',
            firstName: guestName.firstName,
            lastName: guestName.lastName,
            phone: guestPhone,
            email: guestEmail,
          }],
          roomAssociations: [{
            guestReferences: [{ guestReference: '1' }],
            hotelOfferId: selectedOffer.offer.id,
          }],
          payment: {
            method: 'CREDIT_CARD' as const,
            paymentCard: {
              paymentCardInfo: {
                vendorCode: 'VI',
                holderName: `${guestName.firstName} ${guestName.lastName}`,
                cardNumber: '4111111111111111',
                expiryDate: '2026-12',
              },
            },
          },
        },
      });
      setBookingResult(res);
      setView('confirmation');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-900 to-amber-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">🏨 حجز الفنادق</h1>
          <p className="text-amber-200 text-lg">أفضل الفنادق في وجهتك المفضلة</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* ── Search Form ── */}
        {view === 'search' && (
          <form onSubmit={handleSearchHotels} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رمز المدينة (IATA)</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={cityCode}
                  onChange={(e) => setCityCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-center font-mono text-xl"
                  placeholder="RUH"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الغرف</label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الدخول</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الخروج</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد البالغين</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-l from-amber-600 to-amber-700 text-white font-bold rounded-xl hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 transition-all text-lg"
            >
              {loading ? 'جاري البحث...' : '🔍 بحث عن فنادق'}
            </button>
          </form>
        )}

        {/* ── Hotels List ── */}
        {view === 'hotels' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setView('search')} className="text-amber-700 hover:text-amber-900">→ تعديل البحث</button>
              <h2 className="text-xl font-bold">{hotels.length} فندق متاح في {cityCode}</h2>
            </div>

            <button
              onClick={() => handleSearchOffers(hotels.map(h => h.hotelId))}
              disabled={loading}
              className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? 'جاري تحميل الأسعار...' : '💰 عرض الأسعار لجميع الفنادق'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.slice(0, 40).map((hotel) => (
                <div key={hotel.hotelId} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg mb-1">{hotel.name || hotel.hotelId}</h3>
                  <div className="text-sm text-gray-500 mb-2">
                    {hotel.geoCode && `${hotel.geoCode.latitude.toFixed(3)}, ${hotel.geoCode.longitude.toFixed(3)}`}
                    {hotel.distance && ` — ${hotel.distance.value} ${hotel.distance.unit}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {hotel.hotelId}
                    {hotel.chainCode && ` | سلسلة: ${hotel.chainCode}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Hotel Offers ── */}
        {view === 'offers' && (
          <div className="space-y-4">
            <button onClick={() => setView('hotels')} className="text-amber-700 hover:text-amber-900">→ رجوع لقائمة الفنادق</button>

            {hotelOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <p className="text-xl text-gray-600">لا تتوفر عروض الأسعار حالياً</p>
              </div>
            ) : (
              hotelOffers.map((ho) => (
                <div key={ho.hotel.hotelId} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 bg-amber-50 border-b">
                    <h3 className="font-bold text-lg">{ho.hotel.name || ho.hotel.hotelId}</h3>
                  </div>
                  {ho.offers?.map((offer) => (
                    <div key={offer.id} className="p-4 border-b last:border-b-0 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{offer.room.typeEstimated?.category || 'غرفة قياسية'}</div>
                        <div className="text-sm text-gray-500">
                          {offer.room.description?.text?.substring(0, 80)}
                        </div>
                        {offer.boardType && (
                          <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {BOARD_LABELS[offer.boardType] || offer.boardType}
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold text-amber-700">
                          {formatPrice(offer.price.total || '0', offer.price.currency || 'SAR')}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOffer({ hotel: ho.hotel, offer });
                            setView('booking');
                          }}
                          className="mt-2 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                        >
                          احجز الآن
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Booking Form ── */}
        {view === 'booking' && selectedOffer && (
          <form onSubmit={handleBook} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <button type="button" onClick={() => setView('offers')} className="text-amber-700 hover:text-amber-900">→ رجوع</button>

            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="font-bold">{selectedOffer.hotel.name}</h3>
              <p className="text-sm text-gray-600">{selectedOffer.offer.room.typeEstimated?.category}</p>
              <p className="text-xl font-bold text-amber-700 mt-2">
                {formatPrice(selectedOffer.offer.price.total || '0', selectedOffer.offer.price.currency || 'SAR')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
                <input
                  type="text" required
                  value={guestName.firstName}
                  onChange={(e) => setGuestName(p => ({ ...p, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العائلة</label>
                <input
                  type="text" required
                  value={guestName.lastName}
                  onChange={(e) => setGuestName(p => ({ ...p, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email" required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                <input
                  type="tel" required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-l from-green-600 to-green-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {loading ? 'جاري الحجز...' : '✅ تأكيد حجز الفندق'}
            </button>
          </form>
        )}

        {/* ── Confirmation ── */}
        {view === 'confirmation' && bookingResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">تم حجز الفندق بنجاح!</h2>
            <p className="text-gray-600">رقم الحجز: <span className="font-mono font-bold">{bookingResult.data?.id || 'N/A'}</span></p>
            <button
              onClick={() => { setView('search'); setBookingResult(null); }}
              className="mt-8 px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              بحث جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
