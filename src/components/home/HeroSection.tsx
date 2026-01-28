import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plane, 
  Hotel, 
  Calendar,
  Users,
  MapPin
} from "lucide-react";

export function HeroSection() {
  const [searchType, setSearchType] = useState<"flights" | "hotels">("flights");

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient opacity-95" />
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-secondary/30 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-40 left-20 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-up">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-primary-foreground text-sm font-medium">
              أكثر من 10,000 رحلة ناجحة
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            اكتشف العالم مع
            <span className="block mt-2 text-secondary">مشروك</span>
          </h1>

          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            رحلات استثنائية بأسعار لا تُقاوم. احجز رحلتك القادمة واستمتع بتجربة سفر فريدة من نوعها.
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl p-6 shadow-hover animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSearchType("flights")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  searchType === "flights"
                    ? "hero-gradient text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <Plane className="w-5 h-5" />
                رحلات الطيران
              </button>
              <button
                onClick={() => setSearchType("hotels")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  searchType === "hotels"
                    ? "hero-gradient text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <Hotel className="w-5 h-5" />
                الفنادق
              </button>
            </div>

            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder={searchType === "flights" ? "من أين؟" : "الوجهة"}
                  className="pr-10 h-12 bg-muted border-0"
                />
              </div>
              {searchType === "flights" && (
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="إلى أين؟"
                    className="pr-10 h-12 bg-muted border-0"
                  />
                </div>
              )}
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="التاريخ"
                  className="pr-10 h-12 bg-muted border-0"
                />
              </div>
              <div className="relative">
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="عدد المسافرين"
                  className="pr-10 h-12 bg-muted border-0"
                />
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full md:w-auto mt-6 gap-2">
              <Search className="w-5 h-5" />
              ابحث الآن
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">+500</p>
              <p className="text-primary-foreground/70">وجهة حول العالم</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">+10K</p>
              <p className="text-primary-foreground/70">عميل سعيد</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">24/7</p>
              <p className="text-primary-foreground/70">دعم متواصل</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
