'use client';

import { FlightOffer, Traveler } from '@/lib/amadeus/types';
import { formatPrice, formatDuration, formatTime, getStopsLabel } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  offer: FlightOffer;
  onBook: (travelers: Traveler[]) => void;
  onBack: () => void;
  loading: boolean;
}

export default function FlightBookingForm({ offer, onBook, onBack, loading }: Props) {
  const totalPax = (offer.travelerPricings?.length || 1);
  const [travelers, setTravelers] = useState<Traveler[]>(
    Array.from({ length: totalPax }, (_, i) => ({
      id: String(i + 1),
      name: { firstName: '', lastName: '' },
      dateOfBirth: '',
      gender: 'MALE',
      contact: {
        emailAddress: '',
        phones: [{ deviceType: 'MOBILE', countryCallingCode: '966', number: '' }],
      },
      documents: [{
        documentType: 'PASSPORT',
        number: '',
        expiryDate: '',
        issuanceCountry: 'SA',
        nationality: 'SA',
        holder: true,
      }],
    }))
  );

  const updateTraveler = (index: number, field: string, value: any) => {
    setTravelers(prev => {
      const updated = [...prev];
      const parts = field.split('.');
      let obj: any = updated[index];
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return [...updated];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook(travelers);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Flight Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
            → رجوع للنتائج
          </button>
          <h2 className="text-xl font-bold">ملخص الرحلة</h2>
        </div>

        {offer.itineraries.map((itinerary, idx) => {
          const firstSeg = itinerary.segments[0];
          const lastSeg = itinerary.segments[itinerary.segments.length - 1];
          return (
            <div key={idx} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <span className="text-sm text-gray-500">{idx === 0 ? 'ذهاب' : 'عودة'}</span>
              <span className="font-medium">{firstSeg.departure.iataCode} → {lastSeg.arrival.iataCode}</span>
              <span>{formatTime(firstSeg.departure.at)}</span>
              <span className="text-sm text-gray-500">{itinerary.duration && formatDuration(itinerary.duration)}</span>
              <span className={`text-xs ${itinerary.segments.length === 1 ? 'text-green-600' : 'text-orange-500'}`}>
                {getStopsLabel(itinerary.segments.length - 1)}
              </span>
            </div>
          );
        })}

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="text-gray-600">السعر الإجمالي</span>
          <span className="text-2xl font-bold text-blue-700">
            {formatPrice(offer.price.grandTotal || offer.price.total, offer.price.currency)}
          </span>
        </div>
      </div>

      {/* Traveler Forms */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {travelers.map((traveler, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">
              المسافر {idx + 1}
              {offer.travelerPricings?.[idx] && (
                <span className="text-sm font-normal text-gray-500 mr-2">
                  ({offer.travelerPricings[idx].travelerType === 'ADULT' ? 'بالغ' :
                    offer.travelerPricings[idx].travelerType === 'CHILD' ? 'طفل' : 'رضيع'})
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول (بالإنجليزية)</label>
                <input
                  type="text"
                  required
                  value={traveler.name.firstName}
                  onChange={(e) => updateTraveler(idx, 'name.firstName', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="MOHAMMED"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العائلة (بالإنجليزية)</label>
                <input
                  type="text"
                  required
                  value={traveler.name.lastName}
                  onChange={(e) => updateTraveler(idx, 'name.lastName', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ALHARBI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  required
                  value={traveler.dateOfBirth || ''}
                  onChange={(e) => updateTraveler(idx, 'dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                <select
                  value={traveler.gender || 'MALE'}
                  onChange={(e) => updateTraveler(idx, 'gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MALE">ذكر</option>
                  <option value="FEMALE">أنثى</option>
                </select>
              </div>

              {idx === 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={traveler.contact?.emailAddress || ''}
                      onChange={(e) => updateTraveler(idx, 'contact.emailAddress', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                    <input
                      type="tel"
                      required
                      value={traveler.contact?.phones?.[0]?.number || ''}
                      onChange={(e) => {
                        const t = { ...travelers[idx] };
                        if (!t.contact) t.contact = {};
                        if (!t.contact.phones) t.contact.phones = [{ deviceType: 'MOBILE', countryCallingCode: '966', number: '' }];
                        t.contact.phones[0].number = e.target.value;
                        const updated = [...travelers];
                        updated[idx] = t;
                        setTravelers(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="5XXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم جواز السفر</label>
                <input
                  type="text"
                  required
                  value={traveler.documents?.[0]?.number || ''}
                  onChange={(e) => {
                    const t = { ...travelers[idx] };
                    if (!t.documents) t.documents = [{ documentType: 'PASSPORT', number: '', holder: true }];
                    t.documents[0].number = e.target.value.toUpperCase();
                    const updated = [...travelers];
                    updated[idx] = t;
                    setTravelers(updated);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء الجواز</label>
                <input
                  type="date"
                  required
                  value={traveler.documents?.[0]?.expiryDate || ''}
                  onChange={(e) => {
                    const t = { ...travelers[idx] };
                    if (!t.documents) t.documents = [{ documentType: 'PASSPORT', number: '', holder: true }];
                    t.documents[0].expiryDate = e.target.value;
                    const updated = [...travelers];
                    updated[idx] = t;
                    setTravelers(updated);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-l from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
              جاري الحجز...
            </span>
          ) : (
            '✅ تأكيد الحجز'
          )}
        </button>
      </form>
    </div>
  );
}
