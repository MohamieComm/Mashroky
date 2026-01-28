import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Percent, 
  Sparkles, 
  AlertCircle,
  Check,
  CreditCard,
  Calendar
} from "lucide-react";

const offers = [
  {
    id: 1,
    title: "عروض شتاء دبي الساحرة",
    description: "استمتع بأجواء دبي الشتوية المعتدلة مع عروض حصرية تشمل الإقامة والطيران والجولات السياحية",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
    discount: 35,
    validUntil: "31 يناير 2024",
    originalPrice: "4,500",
    newPrice: "2,925",
    season: "الموسم الشتوي (نوفمبر - فبراير)",
    includes: [
      "تذكرة طيران ذهاب وعودة",
      "إقامة 5 ليالٍ في فندق 5 نجوم",
      "جولة سياحية في معالم دبي",
      "رحلة صحراوية مع عشاء",
    ],
    tips: [
      "أفضل وقت لزيارة الأماكن المفتوحة",
      "أحضر ملابس خفيفة نهاراً ومعطف خفيف للمساء",
      "احجز مبكراً لضمان أفضل الأسعار",
    ],
  },
  {
    id: 2,
    title: "باقة شهر العسل - المالديف",
    description: "اخلق ذكريات لا تُنسى مع شريك حياتك في أجمل جزر العالم مع باقة رومانسية متكاملة",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
    discount: 25,
    validUntil: "15 فبراير 2024",
    originalPrice: "12,000",
    newPrice: "9,000",
    season: "طوال العام - أفضل وقت (ديسمبر - أبريل)",
    includes: [
      "تذكرة طيران درجة رجال الأعمال",
      "7 ليالٍ في فيلا فوق الماء",
      "إفطار وعشاء يومياً",
      "رحلة غروب رومانسية بالقارب",
      "جلسة سبا للزوجين",
    ],
    tips: [
      "أحضر معدات الغوص الخاصة أو استأجرها من المنتجع",
      "لا تنسَ واقي الشمس المقاوم للماء",
      "احجز العشاء الخاص على الشاطئ مسبقاً",
    ],
  },
  {
    id: 3,
    title: "استكشف سحر إسطنبول",
    description: "اكتشف جمال المدينة التي تجمع بين الشرق والغرب مع جولات ثقافية وتاريخية مميزة",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
    discount: 40,
    validUntil: "عرض محدود",
    originalPrice: "5,500",
    newPrice: "3,300",
    season: "أفضل وقت (أبريل - يونيو، سبتمبر - نوفمبر)",
    includes: [
      "تذكرة طيران ذهاب وعودة",
      "5 ليالٍ في فندق بإطلالة على البوسفور",
      "جولة في آيا صوفيا والمسجد الأزرق",
      "رحلة بحرية في البوسفور",
      "زيارة البازار الكبير",
    ],
    tips: [
      "ارتدِ أحذية مريحة للمشي في الأسواق القديمة",
      "جرّب الكباب التركي والبقلاوة",
      "احرص على زيارة كابادوكيا إن أمكن",
    ],
  },
  {
    id: 4,
    title: "مغامرة سويسرا الألبية",
    description: "استمتع بجمال جبال الألب السويسرية مع أنشطة شتوية مثيرة ومناظر طبيعية خلابة",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
    discount: 30,
    validUntil: "28 فبراير 2024",
    originalPrice: "8,000",
    newPrice: "5,600",
    season: "الموسم الشتوي للتزلج (ديسمبر - مارس)",
    includes: [
      "تذكرة طيران ذهاب وعودة",
      "6 ليالٍ في شاليه جبلي فاخر",
      "تذكرة تزلج 4 أيام",
      "رحلة قطار بانورامي",
      "تأمين سفر شامل",
    ],
    tips: [
      "أحضر ملابس شتوية دافئة ومقاومة للماء",
      "احجز دروس التزلج مسبقاً للمبتدئين",
      "لا تفوّت تجربة الشوكولاتة السويسرية!",
    ],
  },
];

export default function Offers() {
  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-20 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-primary-foreground font-semibold">عروض حصرية محدودة</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              عروض الأسبوع المميزة
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              اغتنم الفرصة واحجز رحلتك القادمة بأسعار استثنائية مع نصائح وإرشادات قيّمة لكل وجهة
            </p>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-2/5 h-72 lg:h-auto relative">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-foreground/60 to-transparent lg:bg-gradient-to-r" />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="gold-gradient text-secondary-foreground font-bold px-4 py-2 rounded-xl flex items-center gap-1">
                        <Percent className="w-5 h-5" />
                        <span className="text-xl">{offer.discount}%</span>
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">صالح حتى: {offer.validUntil}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-3/5 p-8">
                    <h3 className="text-2xl font-bold mb-3">{offer.title}</h3>
                    <p className="text-muted-foreground mb-4">{offer.description}</p>

                    {/* Season */}
                    <div className="flex items-center gap-2 bg-accent rounded-lg px-4 py-2 inline-block mb-6">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{offer.season}</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* What's Included */}
                      <div>
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-secondary" />
                          الباقة تشمل:
                        </h4>
                        <ul className="space-y-2">
                          {offer.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tips */}
                      <div>
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-secondary" />
                          نصائح للرحلة:
                        </h4>
                        <ul className="space-y-2">
                          {offer.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground line-through">
                            {offer.originalPrice} ر.س
                          </p>
                          <p className="text-3xl font-bold text-primary">
                            {offer.newPrice} <span className="text-base">ر.س</span>
                          </p>
                        </div>
                        <div className="bg-destructive/10 text-destructive text-sm font-semibold px-3 py-1 rounded-full">
                          وفر {parseInt(offer.originalPrice.replace(",", "")) - parseInt(offer.newPrice.replace(",", ""))} ر.س
                        </div>
                      </div>
                      <Button variant="hero" size="lg">احجز الآن</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold">طرق الدفع المتاحة</h3>
                <p className="text-sm text-muted-foreground">ادفع بالطريقة التي تناسبك</p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Apple Pay</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Samsung Pay</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Visa</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Mastercard</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">مدى</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
