import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CalendarDays, ArrowLeft, Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { defaultArticles, useAdminCollection } from "@/data/adminStore";

// نصائح السفر والسياحة المفيدة
export const travelTips = [
  {
    id: 1,
    title: "كيفية حزم حقيبة سفر",
    category: "نصائح",
    readTime: "5 دقائق",
    views: 2450,
    date: "2026-02-04",
    author: "أحمد المسافر",
    image: "https://images.unsplash.com/photo-1512453391709-c5d2f4c5c5e0",
    excerpt: "تعلم كيف تحزم حقيبتك بشكل ذكي واحترافي لتجنب المشاكل والأوزان الزائدة والضياع.",
    content: `
حزم حقيبة السفر بشكل صحيح هو فن يحتاج للتعلم. إليك أهم النصائح لحزم حقيبة سفر بطريقة ذكية واحترافية.

## كيفية تنظيم الحقيبة

### الأشياء التي تحتاج
* ملابس قابلة للطي (20-30 قطعة فقط)
* أدوات النظافة الشخصية الضرورية
* أدوات الشحن للأجهزة الإلكترونية
* حقائب استخدامية صغيرة لتنظيم المتعلقات

### نصائح عند الحزم
* لا تحزم أكثر من 50 بالمئة فقط
* اترك مساحة إضافية في الحقيبة للهدايا
* استخدم المكعبات التنظيمية

## نصائح مهمة

1. **الملابس**: اختر الملابس من الأقمشة الخفيفة
2. **الأحذية**: ضع الأشياء الثقيلة داخلها
3. **الأدوية**: احتفظ بها في حقيبتك اليدوية
4. **المستندات**: ضع نسخة رقمية من كل المستندات
    `
  },
  {
    id: 2,
    title: "أفضل وقت للسفر للوجهات المختلفة",
    category: "تخطيط",
    readTime: "8 دقائق",
    views: 1823,
    date: "2026-02-02",
    author: "سارة العبدالله",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
    excerpt: "اختيار الوقت المناسب لزيارة الوجهات السياحية يمكن أن يحدث فارقاً كبيراً في تجربتك.",
    content: `
اختيار التوقيت المثالي لرحلتك يمكن أن يوفر لك الكثير من المال والمتاعب. إليك دليل للأوقات المثالية:

## الأوقات حسب الفصول

### 1. فصول الربيع
- أفضل وقت 4-6 أشهر من السنة
- الطقس معتدل في أغلب البلدان

### 2. فصول الصيف
- الأسعار مرتفعة لكن مناسب للعوائل
- تجنب درجات الحرارة المرتفعة
- احجز مسبقاً

### 3. فصول في جنوب شرق آسيا
- تجنب موسم الأمطار الموسمية الشديدة
- أفضل وقت من نوفمبر إلى مارس

### 4. فصول لأوروبا وأمريكا الشمالية
- الربيع من أبريل لمايو
- الخريف من سبتمبر لأكتوبر
    `
  },
  {
    id: 3,
    title: "نصائح السلامة للمسافرين",
    category: "السلامة",
    readTime: "6 دقائق",
    views: 3156,
    date: "2026-02-01",
    author: "خالد الأحمدي",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
    excerpt: "تعرف على أهم النصائح والإجراءات للحفاظ على سلامتك أثناء رحلاتك حول العالم.",
    content: `
السلامة هي أولوية قصوى لأي مسافر. إليك أهم النصائح للحفاظ على سلامتك أثناء السفر:

## الإجراءات الأساسية

### 1. قبل السفر
- احصل على التأمين الصحي
- قم بحفظ رقم 6 جهات الطوارئ المحلية

### 2. المستندات
- احتفظ بنسخ رقمية من جواز السفر
- ضع نسخة ورقية منفصلة

### 3. الأموال
- استخدم الخزنات الفندقية
- لا تحمل مبالغ نقدية كبيرة

### 4. التواصل والاتصال
- شارك مسار رحلتك مع العائلة
- احتفظ برقم السفارة
- حمّل تطبيقات الطوارئ
    `
  },
  {
    id: 4,
    title: "دليل المطاعم في دبي",
    category: "طعام",
    readTime: "7 دقائق",
    views: 2789,
    date: "2026-01-30",
    author: "فاطمة السعيد",
    image: "https://images.unsplash.com/photo-1504674900757-da26b07bfd83",
    excerpt: "استكشف أفضل المطاعم في مدينة دبي للمأكولات العالمية والمحلية.",
    content: `
دبي تقدم تجربة طعام مذهلة من جميع أنحاء العالم.

## المطاعم حسب النوع

### المطبخ الإماراتي
- **مطعم الفنار**: المأكولات التقليدية
- **مطعم العريش**: المشاوي الإماراتية
- **مطعم الساحل**: المأكولات البحرية

### المطبخ العالمي
- **مطعم زوما**: المأكولات اليابانية الحديثة
- **مطعم نواه**: المطبخ الإيطالي الفاخر

### الحلويات
- **مطعم السكر**: حلويات عربية أصيلة
- **مطعم الشوكولا**: نكهات حلوة وفاخرة عالمية
    `
  },
];

export default function Articles() {
  const [selectedArticle, setSelectedArticle] = useState<typeof travelTips[0] | null>(null);
  const latestArticles = useAdminCollection("articles", defaultArticles);

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80 text-lg">مقالات سياحية</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            دليل السفر الشامل
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto text-lg">
            اكتشف نصائح السفر، دليل الوجهات السياحية، ومعلومات مفيدة لرحلتك القادمة.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            {/* Main Articles */}
            <div className="space-y-8">
              {selectedArticle ? (
                // Article Detail View
                <div className="bg-card rounded-2xl p-8 shadow-card">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-primary mb-6 hover:gap-3 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    عودة للمقالات
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
                      {selectedArticle.views.toLocaleString()} قراءة
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold mb-6">{selectedArticle.title}</h1>

                  <div className="prose prose-invert max-w-none text-foreground/90">
                    {selectedArticle.content.split("\n##").map((section, idx) => {
                      if (idx === 0) return <p key={idx} className="mb-6">{section}</p>;
                      const [title, ...rest] = section.split("\n");
                      return (
                        <div key={idx} className="mb-6">
                          <h2 className="text-2xl font-bold mb-4">{title}</h2>
                          {rest.map((line, i) => {
                            if (!line.trim()) return null;
                            if (line.startsWith("###")) {
                              return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace("###", "").trim()}</h3>;
                            }
                            if (line.startsWith("*")) {
                              return <li key={i} className="ml-6 list-disc">{line.replace("*", "").trim()}</li>;
                            }
                            if (line.startsWith("-")) {
                              return <li key={i} className="ml-6 list-disc">{line.replace("-", "").trim()}</li>;
                            }
                            if (line.startsWith("1.") || line.match(/^\d+\./)) {
                              return <li key={i} className="ml-6 list-decimal">{line.replace(/^\d+\.\s*/, "").trim()}</li>;
                            }
                            return <p key={i} className="mb-3">{line}</p>;
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Articles List View
                travelTips.map((article) => (
                  <div
                    key={article.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="grid md:grid-cols-[1fr_300px] gap-4">
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">
                            {article.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{article.readTime}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {new Date(article.date).toLocaleDateString("ar-SA")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.views}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-hidden h-48 md:h-auto">
                        <ImageWithFallback
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackQuery={`${article.category} ${article.title}`}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* أكثر المقالات قراءة */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold mb-4">أكثر المقالات قراءة</h3>
                <div className="space-y-4">
                  {travelTips
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((article, idx) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="pb-4 border-b border-border last:border-0 cursor-pointer hover:text-secondary transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg font-bold text-secondary">{idx + 1}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm group-hover:text-secondary transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {article.views} قراءة
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* الفئات */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold mb-4">الفئات</h3>
                <div className="flex flex-wrap gap-2">
                  {["نصائح", "تخطيط", "السلامة", "طعام", "سياحة"].map((cat) => (
                    <button
                      key={cat}
                      className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}
