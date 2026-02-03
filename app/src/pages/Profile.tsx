import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plane,
  Hotel,
  Clock,
  Edit,
  Settings,
  LogOut,
  CreditCard,
  Bell,
  Shield,
} from "lucide-react";

const bookingHistory = [
  {
    id: 1,
    type: "flight",
    title: "رحلة إلى دبي",
    date: "15 فبراير 2026",
    status: "مكتملة",
    price: "1,250",
    details: "الرياض → دبي | درجة الأعمال",
  },
  {
    id: 2,
    type: "hotel",
    title: "فندق برج العرب",
    date: "15-20 فبراير 2026",
    status: "مكتملة",
    price: "8,500",
    details: "5 ليالٍ | جناح ديلوكس",
  },
  {
    id: 3,
    type: "flight",
    title: "رحلة إلى إسطنبول",
    date: "10 مارس 2026",
    status: "قادمة",
    price: "2,100",
    details: "جدة → إسطنبول | درجة رجال الأعمال",
  },
];

export default function Profile() {
  const { user, profile, updateProfile, signOut, role, loading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<
    "info" | "bookings" | "payments" | "notifications" | "settings"
  >("info");
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
  });

  useEffect(() => {
    setFormState({
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
    });
  }, [profile?.full_name, profile?.phone, profile?.address]);

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const displayName =
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : "مستخدم");

  const handleSave = async () => {
    const { error } = await updateProfile({
      full_name: formState.fullName || null,
      phone: formState.phone || null,
      address: formState.address || null,
    });
    if (error) {
      toast({
        title: "تعذر الحفظ",
        description: "تحقق من الاتصال وحاول مرة أخرى.",
        variant: "destructive",
      });
      return;
    }
    setIsEditing(false);
    toast({
      title: "تم الحفظ",
      description: "تم تحديث بياناتك بنجاح.",
    });
  };

  return (
    <Layout>
      <section className="py-20 bg-muted min-h-screen">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
                {/* Profile Photo */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <p className="text-muted-foreground">{role === "admin" ? "مسؤول" : "عضو"}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <Button
                    variant={activeSection === "info" ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection("info")}
                  >
                    <User className="w-5 h-5" />
                    معلوماتي
                  </Button>
                  <Button
                    variant={activeSection === "bookings" ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection("bookings")}
                  >
                    <Calendar className="w-5 h-5" />
                    حجوزاتي
                  </Button>
                  <Button
                    variant={activeSection === "payments" ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection("payments")}
                  >
                    <CreditCard className="w-5 h-5" />
                    طرق الدفع
                  </Button>
                  <Button
                    variant={activeSection === "notifications" ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection("notifications")}
                  >
                    <Bell className="w-5 h-5" />
                    الإشعارات
                  </Button>
                  <Button
                    variant={activeSection === "settings" ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection("settings")}
                  >
                    <Settings className="w-5 h-5" />
                    الإعدادات
                  </Button>
                  {role === "admin" && (
                    <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 text-primary">
                        <Shield className="w-4 h-4" />
                        لديك صلاحيات الإدارة
                      </div>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                    onClick={signOut}
                  >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                  </Button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {activeSection === "info" && (
                <>
                  {/* Personal Info */}
                  <div className="bg-card rounded-2xl p-8 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">المعلومات الشخصية</h3>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleSave}>
                        حفظ
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setFormState({
                            fullName: profile?.full_name ?? "",
                            phone: profile?.phone ?? "",
                            address: profile?.address ?? "",
                          });
                        }}
                      >
                        إلغاء
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4" />
                      تعديل
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">الاسم الكامل</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={formState.fullName}
                        className="pr-10"
                        readOnly={!isEditing}
                        onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input value={user?.email ?? ""} className="pr-10" readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">رقم الجوال</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={formState.phone}
                        className="pr-10 text-left"
                        dir="ltr"
                        inputMode="tel"
                        readOnly={!isEditing}
                        onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">المدينة</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={formState.address}
                        className="pr-10"
                        readOnly={!isEditing}
                        onChange={(e) => setFormState((prev) => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-card rounded-2xl p-6 shadow-card text-center">
                      <div className="w-14 h-14 hero-gradient rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Plane className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <p className="text-3xl font-bold">12</p>
                      <p className="text-muted-foreground">رحلة طيران</p>
                    </div>
                    <div className="bg-card rounded-2xl p-6 shadow-card text-center">
                      <div className="w-14 h-14 gold-gradient rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Hotel className="w-7 h-7 text-secondary-foreground" />
                      </div>
                      <p className="text-3xl font-bold">8</p>
                      <p className="text-muted-foreground">حجز فندقي</p>
                    </div>
                    <div className="bg-card rounded-2xl p-6 shadow-card text-center">
                      <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-7 h-7 text-accent-foreground" />
                      </div>
                      <p className="text-3xl font-bold">2</p>
                      <p className="text-muted-foreground">حجز قادم</p>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "bookings" && (
                <div className="bg-card rounded-2xl p-8 shadow-card">
                  <h3 className="text-xl font-bold mb-6">سجل الحجوزات</h3>

                  <div className="space-y-4">
                    {bookingHistory.map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            booking.type === "flight" ? "hero-gradient" : "gold-gradient"
                          }`}
                        >
                          {booking.type === "flight" ? (
                            <Plane className="w-6 h-6 text-primary-foreground" />
                          ) : (
                            <Hotel className="w-6 h-6 text-secondary-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{booking.title}</h4>
                          <p className="text-sm text-muted-foreground">{booking.details}</p>
                          <p className="text-sm text-muted-foreground">{booking.date}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary">{booking.price} ر.س</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === "مكتملة"
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary/10 text-secondary"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-6">
                    عرض جميع الحجوزات
                  </Button>
                </div>
              )}

              {activeSection === "payments" && (
                <div className="bg-card rounded-2xl p-8 shadow-card space-y-4">
                  <h3 className="text-xl font-bold">طرق الدفع</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-xl p-4">
                      <p className="font-semibold">بطاقة فيزا</p>
                      <p className="text-sm text-muted-foreground">•••• 4216</p>
                    </div>
                    <div className="border border-border rounded-xl p-4">
                      <p className="font-semibold">Apple Pay</p>
                      <p className="text-sm text-muted-foreground">مفعّل</p>
                    </div>
                  </div>
                  <Button variant="outline">إضافة طريقة دفع</Button>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="bg-card rounded-2xl p-8 shadow-card space-y-6">
                  <h3 className="text-xl font-bold">إعدادات الإشعارات</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">إشعارات العروض</p>
                      <p className="text-sm text-muted-foreground">عروض موسمية وتنبيهات مهمة.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">إشعارات الحجوزات</p>
                      <p className="text-sm text-muted-foreground">تأكيد الحجز والتحديثات.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              )}

              {activeSection === "settings" && (
                <div className="bg-card rounded-2xl p-8 shadow-card space-y-4">
                  <h3 className="text-xl font-bold">الإعدادات العامة</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">تفعيل الوضع الليلي</p>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">استقبال الرسائل التسويقية</p>
                    <Switch defaultChecked />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
