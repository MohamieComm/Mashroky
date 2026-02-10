import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CalendarDays, ArrowLeft, Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { defaultArticles, useAdminCollection } from "@/data/adminStore";

export const travelTips = [
  {
    id: 1,
    title: "خطة سهلة لتجهيز حقيبة السفر",
    category: "نصائح السفر",
    readTime: "5 دقائق",
    views: 2450,
    date: "2026-02-04",
    author: "فريق مشروك",
    image: "https://source.unsplash.com/1200x800/?travel,packing",
    excerpt: "خطوات عملية لاختيار الملابس والمستلزمات الأساسية بدون زيادة الوزن.",
    content: `
نظّم حقيبتك بذكاء لتوفر المساحة وتجنب الرسوم الإضافية.

## قبل التعبئة
- راجع حالة الطقس في وجهتك.
- حدّد مدة الرحلة وعدد القطع المناسبة.
- جهّز قائمة مختصرة بالأشياء الأساسية.

## أثناء التعبئة
- استخدم مكعبات التنظيم.
- ضع القطع الثقيلة في الأسفل.
- احتفظ بالمستندات في جيب يسهل الوصول إليه.

## نصائح إضافية
1. اترك مساحة لهدايا العودة.
2. احمل شاحنًا وبطارية احتياطية.
3. لا تنسَ أدويةك الضرورية.
    `,
  },
  {
    id: 2,
    title: "كيف تختار الفندق المناسب؟",
    category: "الفنادق",
    readTime: "8 دقائق",
    views: 1823,
    date: "2026-02-02",
    author: "فريق مشروك",
    image: "https://source.unsplash.com/1200x800/?hotel,lobby",
    excerpt: "معايير بسيطة تساعدك على اختيار فندق يلائم ميزانيتك واحتياجاتك.",
    content: `
اختيار الفندق الصحيح يصنع فرقًا كبيرًا في تجربة السفر.

## أهم المعايير
- الموقع وقربه من المعالم.
- تقييمات النزلاء الموثوقة.
- مستوى النظافة والخدمات.

## نصائح سريعة
- قارن بين أكثر من خيار.
- اقرأ التعليقات الأخيرة.
- تأكد من سياسة الإلغاء.
    `,
  },
  {
    id: 3,
    title: "السفر الاقتصادي بدون التنازل عن الجودة",
    category: "توفير",
    readTime: "6 دقائق",
    views: 3156,
    date: "2026-02-01",
    author: "فريق مشروك",
    image: "https://source.unsplash.com/1200x800/?budget,travel",
    excerpt: "استفد من الحجز المبكر والعروض الموسمية لتحقيق أفضل قيمة.",
    content: `
يمكنك تقليل التكاليف مع الحفاظ على جودة الرحلة.

## طرق فعالة للتوفير
- اختر تواريخ مرنة للسفر.
- فعّل إشعارات العروض.
- استخدم الباقات التي تشمل الطيران والإقامة.

## تذكير
أفضل الأسعار غالبًا تكون قبل موعد السفر بوقت كافٍ.
    `,
  },
];

type TipArticle = (typeof travelTips)[number];

export default function Articles() {
  const [selectedArticle, setSelectedArticle] = useState<TipArticle | null>(null);
  const latestArticles = useAdminCollection("articles", defaultArticles).slice(0, 6);

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80 text-lg">محتوى ملهم للسفر</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            مقالات ونصائح السفر
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto text-lg">
            اكتشف أدلة عملية ونصائح مختصرة تساعدك على التخطيط لرحلتك بثقة.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className="space-y-8">
              {selectedArticle ? (
                <div className="bg-card rounded-2xl p-8 shadow-card">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-primary mb-6 hover:gap-3 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    العودة إلى المقالات
                  </button>

                  <ImageWithFallback
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full h-96 object-cover rounded-xl mb-6"
                    fallbackQuery={selectedArticle.title}
                  />

                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedArticle.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(selectedArticle.date).toLocaleDateString("ar-SA")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {selectedArticle.readTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {selectedArticle.views.toLocaleString()} مشاهدة
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-4">{selectedArticle.title}</h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    {selectedArticle.content
                      .trim()
                      .split("\n")
                      .filter(Boolean)
                      .map((line, idx) => {
                        if (line.startsWith("## ")) {
                          return (
                            <h3 key={idx} className="text-lg font-semibold text-foreground mt-4">
                              {line.replace("## ", "")}
                            </h3>
                          );
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <li key={idx} className="list-disc mr-5">
                              {line.replace("- ", "")}
                            </li>
                          );
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                  </div>
                </div>
              ) : (
                travelTips.map((article) => (
                  <div
                    key={article.id}
                    className="bg-card rounded-2xl p-6 shadow-card hover:shadow-hover transition-all"
                  >
                    <ImageWithFallback
                      src={article.image}
                      alt={article.title}
                      className="w-full h-56 object-cover rounded-xl mb-4"
                      fallbackQuery={article.title}
                    />
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="bg-muted px-3 py-1 rounded-full">{article.category}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                    <Button variant="outline" onClick={() => setSelectedArticle(article)}>
                      اقرأ المزيد
                    </Button>
                  </div>
                ))
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold mb-4">آخر المقالات</h3>
                <div className="space-y-4">
                  {latestArticles.map((article) => (
                    <div key={article.id} className="flex items-center gap-4">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-20 h-20 rounded-lg object-cover"
                        fallbackQuery={article.title}
                      />
                      <div>
                        <p className="text-sm text-muted-foreground">{article.category}</p>
                        <p className="font-semibold">{article.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/40 rounded-2xl p-6">
                <h4 className="text-lg font-bold mb-2">هل لديك سؤال؟</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  تواصل معنا وسنساعدك في تخطيط رحلتك خطوة بخطوة.
                </p>
                <Button variant="hero" className="w-full" onClick={() => (window.location.href = "/support")}>
                  تواصل مع الدعم
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}
