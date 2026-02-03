import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { 
  Clock, 
  Percent, 
  Sparkles, 
  AlertCircle,
  Check,
  CreditCard,
  Calendar
} from "lucide-react";
import { defaultOffers, useAdminCollection } from "@/data/adminStore";


export default function Offers() {
  const offers = useAdminCollection("offers", defaultOffers);

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
              أفضل عروض رحلات سياحية من السعودية
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              باقات شاملة للطيران والفنادق والأنشطة والمواصلات مع توصيات موسمية لكل وجهة.
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
                    <ImageWithFallback
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
                          وفر {Number(offer.originalPrice.replace(/,/g, "")) - Number(offer.newPrice.replace(/,/g, ""))} ر.س
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
