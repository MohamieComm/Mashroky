import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { defaultActivities, type ActivityItem, useAdminCollection } from "@/data/adminStore";
import { resolveRelevantImage, safeArabicText } from "@/lib/contentQuality";

export function WeeklyOffers() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const activities = useAdminCollection("activities", defaultActivities)
    .slice(0, 4)
    .map((activity, index) => {
      const fallback = defaultActivities[index] || defaultActivities[0];
      const title = safeArabicText(activity.title, fallback?.title || "نشاط سياحي");
      const location = safeArabicText(activity.location, fallback?.location || "مدينة سياحية");
      return {
        ...activity,
        title,
        location,
        category: safeArabicText(activity.category, fallback?.category || "ترفيه"),
        image: resolveRelevantImage(activity.image, title, location, fallback?.image || ""),
      };
    });

  const handleBook = (activity: ActivityItem) => {
    const priceValue =
      Number(String(activity.price || "").replace(/[^\\d.]/g, "")) || 0;
    addItem({
      id: `activity-${activity.title}-${Date.now()}`,
      title: activity.title,
      price: priceValue,
      details: activity.location,
      image: activity.image,
      type: "activity",
    });
    navigate("/cart");
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            تجارب وأنشطة لا تُفوّت
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            اختر تجربة تجمع بين المتعة والمغامرة والثقافة حسب وجهتك واهتماماتك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((activity, index) => (
            <div
              key={activity.id || `activity-home-${index}`}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  fallbackQuery={`${activity.location} نشاطات سياحية`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-primary">
                  {activity.category}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold mb-1">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.location}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                  {[activity.category, activity.location]
                    .filter(Boolean)
                    .map((item) => (
                      <span key={item} className="bg-muted px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">يبدأ من</p>
                    <p className="text-xl font-bold text-primary">
                      {activity.price} <span className="text-sm">ر.س</span>
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleBook(activity)}
                  >
                    احجز
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/tours">
            <Button variant="outline" size="lg" className="gap-2">
              عرض المزيد من النشاطات
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
