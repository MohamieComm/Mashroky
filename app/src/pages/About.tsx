import { Layout } from "@/components/layout/Layout";
import { Shield, Sparkles, Users, Globe, Bot, CreditCard } from "lucide-react";

const highlights = [
  {
    icon: Globe,
    title: "تغطية عالمية",
    description: "وجهات داخلية ودولية بأسعار منافسة وتحديثات مستمرة للمواسم.",
  },
  {
    icon: Bot,
    title: "مساعد ذكي",
    description: "اقتراحات ذكية للرحلات والعروض بناءً على تفضيلاتك.",
  },
  {
    icon: CreditCard,
    title: "مدفوعات آمنة",
    description: "دعم Apple Pay وSamsung Pay وبوابات دفع موثوقة.",
  },
  {
    icon: Users,
    title: "دعم عملاء مخصص",
    description: "فريق خدمة عملاء سريع الاستجابة قبل وبعد الحجز.",
  },
  {
    icon: Shield,
    title: "ثقة وأمان",
    description: "معايير أمان عالية وحماية لبياناتك وخصوصيتك.",
  },
  {
    icon: Sparkles,
    title: "عروض مُنسّقة",
    description: "باقات مختارة بعناية تجمع بين الطيران والإقامة والأنشطة.",
  },
];

export default function About() {
  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">من نحن</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            مشروك منصة حجوزات ذكية
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            نجمع لك الطيران والفنادق والأنشطة في تجربة واحدة سهلة وموثوقة.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-2xl font-bold mb-3">قصتنا</h2>
                <p className="text-muted-foreground leading-relaxed">
                  بدأت مشروك كفكرة لتبسيط الحجز السياحي. واليوم نوفر منصة تجمع أفضل الخيارات
                  للمسافرين مع مرونة في التخصيص ودعم متواصل.
                </p>
              </div>
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-2xl font-bold mb-3">ما الذي يميزنا؟</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• تحديثات يومية للعروض والأسعار حسب الموسم.</li>
                  <li>• تجربة حجز متكاملة من البحث حتى الدفع.</li>
                  <li>• تكامل مع مزودين موثوقين في الطيران والفنادق.</li>
                  <li>• واجهة عربية سهلة وسريعة على مختلف الأجهزة.</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted rounded-3xl p-8 shadow-card">
              <h3 className="text-xl font-bold mb-4">قيمنا</h3>
              <p className="text-muted-foreground mb-6">
                نعمل بشغف لتقديم تجربة سفر ملهمة، ونضع ثقة المستخدم في مقدمة أولوياتنا.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {highlights.slice(0, 3).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center text-primary-foreground">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">مزايا مشروك</h2>
            <p className="text-muted-foreground mt-3">
              تجارب سفر مختارة بعناية وخدمات متكاملة تناسب احتياجاتك.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
