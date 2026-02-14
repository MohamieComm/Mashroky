import Link from 'next/link';

const services = [
  {
    href: '/flights',
    icon: '✈️',
    title: 'حجز الرحلات',
    description: 'ابحث عن أفضل أسعار الرحلات من جميع شركات الطيران العالمية',
    color: 'from-blue-600 to-blue-800',
    hoverColor: 'hover:from-blue-700 hover:to-blue-900',
  },
  {
    href: '/hotels',
    icon: '🏨',
    title: 'حجز الفنادق',
    description: 'أفضل الفنادق والمنتجعات بأسعار تنافسية حول العالم',
    color: 'from-amber-600 to-amber-800',
    hoverColor: 'hover:from-amber-700 hover:to-amber-900',
  },
  {
    href: '/transfers',
    icon: '🚗',
    title: 'خدمات النقل',
    description: 'توصيل من وإلى المطار — خاص ومشترك وتاكسي',
    color: 'from-emerald-600 to-emerald-800',
    hoverColor: 'hover:from-emerald-700 hover:to-emerald-900',
  },
  {
    href: '/activities',
    icon: '🎯',
    title: 'الأنشطة والتجارب',
    description: 'اكتشف أفضل الأنشطة السياحية في وجهتك المفضلة',
    color: 'from-purple-600 to-purple-800',
    hoverColor: 'hover:from-purple-700 hover:to-purple-900',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero */}
      <div className="bg-gradient-to-l from-blue-900 via-blue-800 to-indigo-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">مشروك</h1>
          <p className="text-xl text-blue-200 mb-2">منصة حجز السفر المتكاملة</p>
          <p className="text-blue-300">رحلات · فنادق · نقل · أنشطة — كل ما تحتاجه في مكان واحد</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc) => (
            <Link
              key={svc.href}
              href={svc.href}
              className={`block bg-gradient-to-l ${svc.color} ${svc.hoverColor} text-white rounded-2xl shadow-xl p-8 transition-all transform hover:scale-[1.02]`}
            >
              <div className="text-5xl mb-4">{svc.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{svc.title}</h2>
              <p className="text-white/80">{svc.description}</p>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">لماذا مشروك؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2">آمن وموثوق</h3>
              <p className="text-gray-600">حجوزات مباشرة عبر Amadeus API العالمية</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-lg mb-2">أفضل الأسعار</h3>
              <p className="text-gray-600">مقارنة أسعار فورية من مئات الشركات</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-bold text-lg mb-2">تغطية عالمية</h3>
              <p className="text-gray-600">ملايين الخيارات حول العالم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
