import { Shield, Headphones, CreditCard, Award, Clock, Heart, Bot } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "حجز آمن 100%",
    description: "حماية بياناتك الشخصية والمالية بأعلى معايير التشفير",
  },
  {
    icon: Headphones,
    title: "دعم عربي 24/7",
    description: "فريق متخصص يتحدث لغتك متاح لخدمتك في أي وقت",
  },
  {
    icon: CreditCard,
    title: "دفع مرن ومريح",
    description: "مدى، Apple Pay، Samsung Pay، فيزا، ماستركارد والتقسيط",
  },
  {
    icon: Award,
    title: "باقات متكاملة",
    description: "طيران + فندق + أنشطة + تنقلات بسعر شفاف بدون رسوم خفية",
  },
  {
    icon: Clock,
    title: "حجز في دقائق",
    description: "واجهة سلسة مصممة لتختار وتحجز وتؤكد بسرعة",
  },
  {
    icon: Bot,
    title: "مساعد ذكي",
    description: "يقترح لك الوجهة المثالية حسب الموسم وميزانيتك",
  },
  {
    icon: Heart,
    title: "تجربة مصممة لك",
    description: "رحلات مصممة للعائلات والعرسان والطلاب بخصوصية تامة",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 hero-gradient relative overflow-hidden">
      {/* Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20v20H0V20h20zm0-20v20H0V0h20z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            لماذا تختار <span className="text-secondary">مشروك</span>؟
          </h2>
          <p className="text-primary-foreground/80 mt-4 max-w-xl mx-auto">
            خدمات مصممة لراحتك وثقتك — من التخطيط إلى العودة
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-primary-foreground/20 transition-all duration-300 animate-fade-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-primary-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/70">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
