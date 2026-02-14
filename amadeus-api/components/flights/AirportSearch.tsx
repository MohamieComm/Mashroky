'use client';

import { useState, useEffect, useRef } from 'react';
import { locationsApi } from '@/lib/api-client';
import { Location } from '@/lib/amadeus/types';

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (code: string, name: string) => void;
}

export default function AirportSearch({ label, placeholder, value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res: any = await locationsApi.search(query, 'AIRPORT,CITY');
        setResults(res.data || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
        placeholder={placeholder}
        value={displayValue || query}
        onChange={(e) => {
          setQuery(e.target.value);
          setDisplayValue('');
        }}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
      />
      {loading && (
        <div className="absolute left-3 top-10">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
        </div>
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((loc) => (
            <li
              key={loc.id || loc.iataCode}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-right"
              onClick={() => {
                const code = loc.iataCode || '';
                const name = `${loc.name} (${code})`;
                onChange(code, name);
                setDisplayValue(name);
                setQuery('');
                setIsOpen(false);
              }}
            >
              <div className="font-medium">{loc.name}</div>
              <div className="text-sm text-gray-500">
                {loc.iataCode} — {loc.address?.cityName || ''} {loc.address?.countryCode || ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
