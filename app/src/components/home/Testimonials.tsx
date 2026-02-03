import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "أحمد العتيبي",
    location: "الرياض",
    rating: 5,
    text: "تجربة رائعة مع مشروك! الخدمة ممتازة والأسعار تنافسية. حجزت رحلتي إلى دبي وكانت كل التفاصيل منظمة بشكل احترافي.",
  },
  {
    id: 2,
    name: "سارة المطيري",
    location: "جدة",
    rating: 5,
    text: "أفضل منصة حجز استخدمتها! فريق الدعم متعاون جداً وساعدني في اختيار أفضل الفنادق لشهر العسل. شكراً مشروك!",
  },
  {
    id: 3,
    name: "محمد الشهري",
    location: "الدمام",
    rating: 5,
    text: "سهولة في الحجز وسرعة في التأكيد. العروض الأسبوعية وفرت علي الكثير من المال. أنصح الجميع بتجربة مشروك.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            آراء العملاء
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            ماذا يقول <span className="text-gradient">عملاؤنا</span>؟
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            نفخر بثقة عملائنا ونسعى دائماً لتقديم أفضل الخدمات
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 leading-relaxed mb-8">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div>
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
