import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'مشروك — حجز الرحلات والفنادق',
  description: 'منصة حجز السفر المتكاملة — رحلات، فنادق، نقل، أنشطة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        {/* Navigation */}
        <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-blue-700">
              ✈️ مشروك
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/flights" className="text-gray-600 hover:text-blue-700 font-medium">الرحلات</Link>
              <Link href="/hotels" className="text-gray-600 hover:text-amber-700 font-medium">الفنادق</Link>
              <Link href="/transfers" className="text-gray-600 hover:text-emerald-700 font-medium">النقل</Link>
              <Link href="/activities" className="text-gray-600 hover:text-purple-700 font-medium">الأنشطة</Link>
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">الإدارة</Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
