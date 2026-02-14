import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { saudiHighlights, saudiHeritage, saudiMegaEvents, saudiTourismTopics } from "@/data/content";

export default function Saudi() {
  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">اكتشف المملكة</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            السعودية — وجهة العالم القادمة
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            من العُلا إلى البحر الأحمر، ومن الدرعية إلى عسير — تجارب تجمع عراقة التراث وفخامة المشاريع الكبرى ورؤية 2030.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
            <div className="space-y-6">
              {saudiTourismTopics.map((topic) => (
                <div key={topic.title} className="bg-card rounded-2xl p-8 shadow-card">
                  <h2 className="text-2xl font-bold mb-3">{topic.title}</h2>
                  <p className="text-muted-foreground mb-4">{topic.description}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {topic.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h3 className="text-xl font-bold mb-4">تراث المملكة العالمي</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  {saudiHeritage.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-secondary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-3xl p-8 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-secondary" />
                <h3 className="text-xl font-bold">فعاليات عالمية ترسم المستقبل</h3>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                {saudiMegaEvents.map((event) => (
                  <div key={event.title} className="bg-card rounded-xl p-4 shadow-soft">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <p>{event.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">أفضل أوقات الزيارة</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="bg-card rounded-xl p-4 shadow-soft">
                    <p className="font-semibold text-foreground">الشتاء والربيع</p>
                    <p>الوقت المثالي لزيارة العُلا والدرعية والرياض — طقس معتدل وفعاليات موسمية حصرية.</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 shadow-soft">
                    <p className="font-semibold text-foreground">الصيف</p>
                    <p>أبها وعسير تمنحك أجواء جبلية منعشة — المكان المثالي للمصايف العائلية.</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 shadow-soft">
                    <p className="font-semibold text-foreground">على مدار العام</p>
                    <p>سواحل البحر الأحمر ومشاريع المنتجعات الفاخرة تستقبلك طوال السنة.</p>
                  </div>
                </div>
                <Button variant="hero" className="mt-6 w-full">خطط لرحلتك داخل المملكة</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            وجهات سعودية تستحق الزيارة
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {saudiHighlights.map((dest) => (
              <div key={dest.title} className="bg-card rounded-2xl overflow-hidden shadow-card">
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-full object-cover"
                    fallbackQuery={`${dest.title} السعودية`}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{dest.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{dest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
