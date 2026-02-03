import { Layout } from "@/components/layout/Layout";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { defaultArticles, useAdminCollection } from "@/data/adminStore";
import { travelGuideSections } from "@/data/content";

export default function Articles() {
  const latestArticles = useAdminCollection("articles", defaultArticles);

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">الأخبار والمقالات</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            مقالات ونصائح السفر
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            أحدث الأخبار السياحية، إرشادات للمسافرين، ونصائح لاختيار الوجهة حسب الموسم.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className="space-y-8">
              {travelGuideSections.map((section) => (
                <div key={section.title} className="bg-card rounded-2xl p-8 shadow-card">
                  <h2 className="text-2xl font-bold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground mb-4">{section.intro}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <aside className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold mb-4">أحدث المقالات</h3>
                <div className="space-y-4">
                  {latestArticles.slice(0, 6).map((article) => (
                    <div key={article.id} className="flex items-start gap-3">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs text-secondary font-semibold">{article.category}</p>
                        <p className="font-semibold text-sm leading-snug">{article.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <CalendarDays className="w-3 h-3" />
                          <span>{article.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-6 w-full gap-2">
                  عرض جميع المقالات
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl font-bold">مقالات السفر المضافة حديثًا</h2>
            <Button variant="outline" className="gap-2">
              رؤية المزيد
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <div key={article.id} className="bg-card rounded-2xl overflow-hidden shadow-card">
                <div className="h-52 overflow-hidden">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs text-secondary font-semibold">{article.category}</span>
                  <h3 className="text-lg font-bold mt-2 mb-4">{article.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                  <Button variant="outline" className="mt-4 gap-2">
                    اقرأ المقال
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
