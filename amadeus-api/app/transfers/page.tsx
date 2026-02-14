'use client';

import { useState } from 'react';
import { transfersApi } from '@/lib/api-client';
import { TransferOffer, TransferType } from '@/lib/amadeus/types';
import { formatPrice } from '@/lib/utils';

type View = 'search' | 'results' | 'booking' | 'confirmation';

const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  PRIVATE: 'خاص',
  SHARED: 'مشترك',
  TAXI: 'تاكسي',
  HOURLY: 'بالساعة',
  AIRPORT_EXPRESS: 'قطار سريع',
  AIRPORT_BUS: 'باص المطار',
};

export default function TransfersPage() {
  const [view, setView] = useState<View>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search
  const [startLocationCode, setStartLocationCode] = useState('');
  const [endLocationCode, setEndLocationCode] = useState('');
  const [endAddressLine, setEndAddressLine] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [transferType, setTransferType] = useState<TransferType | ''>('');

  // Results
  const [offers, setOffers] = useState<TransferOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<TransferOffer | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Booking
  const [passengerName, setPassengerName] = useState({ firstName: '', lastName: '' });
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [flightNumber, setFlightNumber] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body: any = {
        startLocationCode,
        startDateTime: new Date(startDateTime).toISOString(),
        passengers,
      };
      if (endLocationCode) body.endLocationCode = endLocationCode;
      if (endAddressLine) body.endAddressLine = endAddressLine;
      if (transferType) body.transferType = transferType;

      const res: any = await transfersApi.search(body);
      setOffers(res.data || []);
      setView('results');
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
      const res = await transfersApi.book({
        offerId: selectedOffer.id,
        data: {
          passengers: [{
            firstName: passengerName.firstName,
            lastName: passengerName.lastName,
            contacts: { phoneNumber: passengerPhone, email: passengerEmail },
          }],
          flightNumber: flightNumber || undefined,
          payment: {
            methodOfPayment: 'CREDIT_CARD',
            creditCard: {
              number: '4111111111111111',
              holderName: `${passengerName.firstName} ${passengerName.lastName}`,
              vendorCode: 'VI',
              expiryDate: '2026-12',
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white" dir="rtl">
      <div className="bg-gradient-to-l from-emerald-900 to-emerald-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">🚗 حجز النقل والتوصيل</h1>
          <p className="text-emerald-200 text-lg">خدمات نقل خاصة ومشتركة من وإلى المطار</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">⚠️ {error}</div>
        )}

        {/* ── Search ── */}
        {view === 'search' && (
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من (رمز المطار/المحطة)</label>
                <input
                  type="text" required maxLength={3}
                  value={startLocationCode}
                  onChange={(e) => setStartLocationCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center font-mono text-xl"
                  placeholder="RUH"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى (رمز أو عنوان)</label>
                <input
                  type="text"
                  value={endLocationCode || endAddressLine}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.length <= 3 && /^[A-Z]*$/i.test(v)) {
                      setEndLocationCode(v.toUpperCase());
                      setEndAddressLine('');
                    } else {
                      setEndAddressLine(v);
                      setEndLocationCode('');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="JED أو عنوان الفندق"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ ووقت الانطلاق</label>
                <input
                  type="datetime-local" required
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الركاب</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخدمة</label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as TransferType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">الكل</option>
                  {Object.entries(TRANSFER_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-l from-emerald-600 to-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 text-lg"
            >
              {loading ? 'جاري البحث...' : '🔍 بحث عن خدمات النقل'}
            </button>
          </form>
        )}

        {/* ── Results ── */}
        {view === 'results' && (
          <div className="space-y-4">
            <button onClick={() => setView('search')} className="text-emerald-700 hover:text-emerald-900">→ تعديل البحث</button>
            <h2 className="text-xl font-bold">{offers.length} خيار نقل متاح</h2>

            {offers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <p className="text-xl text-gray-600">لم يتم العثور على خدمات نقل</p>
              </div>
            ) : (
              offers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          {TRANSFER_TYPE_LABELS[offer.transferType] || offer.transferType}
                        </span>
                        {offer.serviceProvider?.name && (
                          <span className="text-sm text-gray-500">{offer.serviceProvider.name}</span>
                        )}
                      </div>
                      {offer.vehicle && (
                        <div className="text-sm text-gray-600 mb-1">
                          🚘 {offer.vehicle.description || offer.vehicle.category}
                          {offer.vehicle.seats?.[0]?.count && ` — ${offer.vehicle.seats[0].count} مقعد`}
                        </div>
                      )}
                      {offer.duration && (
                        <div className="text-sm text-gray-500">⏱️ المدة: {offer.duration}</div>
                      )}
                      {offer.distance && (
                        <div className="text-sm text-gray-500">📍 المسافة: {offer.distance.value} {offer.distance.unit}</div>
                      )}
                    </div>

                    <div className="text-left">
                      <div className="text-2xl font-bold text-emerald-700">
                        {formatPrice(
                          offer.quotation.monetaryAmount || offer.quotation.totalTransferAmount?.monetaryAmount || '0',
                          offer.quotation.currencyCode || 'SAR',
                        )}
                      </div>
                      {offer.quotation.isEstimated && (
                        <div className="text-xs text-gray-400">سعر تقديري</div>
                      )}
                      <button
                        onClick={() => { setSelectedOffer(offer); setView('booking'); }}
                        className="mt-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        احجز
                      </button>
                    </div>
                  </div>

                  {offer.cancellationRules && offer.cancellationRules.length > 0 && (
                    <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                      سياسة الإلغاء: {offer.cancellationRules[0].ruleDescription}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Booking ── */}
        {view === 'booking' && selectedOffer && (
          <form onSubmit={handleBook} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <button type="button" onClick={() => setView('results')} className="text-emerald-700">→ رجوع</button>

            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="flex justify-between">
                <span>{TRANSFER_TYPE_LABELS[selectedOffer.transferType]}: {selectedOffer.vehicle?.description}</span>
                <span className="font-bold text-emerald-700">
                  {formatPrice(selectedOffer.quotation.monetaryAmount || '0', selectedOffer.quotation.currencyCode || 'SAR')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
                <input type="text" required value={passengerName.firstName}
                  onChange={(e) => setPassengerName(p => ({ ...p, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العائلة</label>
                <input type="text" required value={passengerName.lastName}
                  onChange={(e) => setPassengerName(p => ({ ...p, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" required value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                <input type="tel" required value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الرحلة (اختياري)</label>
                <input type="text" value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="SV123" dir="ltr" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-l from-green-600 to-green-700 text-white font-bold rounded-xl disabled:opacity-50 text-lg">
              {loading ? 'جاري الحجز...' : '✅ تأكيد حجز النقل'}
            </button>
          </form>
        )}

        {/* ── Confirmation ── */}
        {view === 'confirmation' && bookingResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">تم حجز النقل بنجاح!</h2>
            <p className="text-gray-600">رقم الحجز: <span className="font-mono font-bold">{bookingResult.data?.id || 'N/A'}</span></p>
            <button onClick={() => { setView('search'); setBookingResult(null); }}
              className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              بحث جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
