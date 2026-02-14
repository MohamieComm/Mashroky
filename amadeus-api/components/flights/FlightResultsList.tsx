'use client';

import { FlightOffer } from '@/lib/amadeus/types';
import { formatPrice, formatDuration, formatTime, getStopsLabel } from '@/lib/utils';

interface Props {
  offers: FlightOffer[];
  onSelect: (offer: FlightOffer) => void;
  dictionaries?: Record<string, Record<string, string>>;
}

export default function FlightResultsList({ offers, onSelect, dictionaries }: Props) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow">
        <div className="text-6xl mb-4">✈️</div>
        <p className="text-xl text-gray-600">لم يتم العثور على رحلات</p>
        <p className="text-gray-400 mt-2">جرب تغيير معايير البحث</p>
      </div>
    );
  }

  const getAirlineName = (code: string) =>
    dictionaries?.carriers?.[code] || code;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {offers.length} رحلة متاحة
        </h2>
      </div>

      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden"
        >
          {offer.itineraries.map((itinerary, idx) => {
            const firstSeg = itinerary.segments[0];
            const lastSeg = itinerary.segments[itinerary.segments.length - 1];
            const stops = itinerary.segments.length - 1;

            return (
              <div key={idx} className="p-4 border-b last:border-b-0">
                {idx === 1 && (
                  <div className="text-xs text-blue-600 font-medium mb-2">🔄 رحلة العودة</div>
                )}
                <div className="flex items-center justify-between">
                  {/* Airline */}
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                      {firstSeg.carrierCode}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{getAirlineName(firstSeg.carrierCode)}</div>
                      <div className="text-xs text-gray-400">{firstSeg.carrierCode}{firstSeg.number}</div>
                    </div>
                  </div>

                  {/* Departure */}
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatTime(firstSeg.departure.at)}</div>
                    <div className="text-sm text-gray-500">{firstSeg.departure.iataCode}</div>
                  </div>

                  {/* Duration & Stops */}
                  <div className="text-center flex-1 px-4">
                    <div className="text-xs text-gray-400">{itinerary.duration && formatDuration(itinerary.duration)}</div>
                    <div className="relative my-2">
                      <div className="h-px bg-gray-300 w-full" />
                      {stops > 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className={`text-xs font-medium ${stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                      {getStopsLabel(stops)}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatTime(lastSeg.arrival.at)}</div>
                    <div className="text-sm text-gray-500">{lastSeg.arrival.iataCode}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Price & Book */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-l from-blue-50 to-white">
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {formatPrice(offer.price.grandTotal || offer.price.total, offer.price.currency)}
              </div>
              <div className="text-xs text-gray-400">للشخص الواحد</div>
            </div>
            <div className="flex items-center gap-3">
              {offer.numberOfBookableSeats && offer.numberOfBookableSeats <= 5 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  باقي {offer.numberOfBookableSeats} مقاعد
                </span>
              )}
              <button
                onClick={() => onSelect(offer)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                اختيار ←
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
