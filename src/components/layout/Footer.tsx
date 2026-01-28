import { Link } from "react-router-dom";
import { 
  Plane, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="hero-gradient py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-primary-foreground">
                اشترك في نشرتنا البريدية
              </h3>
              <p className="text-primary-foreground/80 mt-1">
                احصل على أفضل العروض والخصومات الحصرية
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Input 
                placeholder="بريدك الإلكتروني" 
                className="bg-background/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 min-w-[250px]"
              />
              <Button variant="gold">اشترك الآن</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">مشروك</span>
              </div>
              <p className="text-background/70 leading-relaxed">
                رفيقك الأمثل لرحلات لا تُنسى. نوفر لك أفضل الخدمات السياحية 
                بأسعار تنافسية وتجربة استثنائية.
              </p>
              <div className="flex gap-3 mt-6">
                <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">روابط سريعة</h4>
              <ul className="space-y-3">
                <li><Link to="/trips" className="text-background/70 hover:text-primary transition-colors">الرحلات</Link></li>
                <li><Link to="/hotels" className="text-background/70 hover:text-primary transition-colors">الفنادق</Link></li>
                <li><Link to="/offers" className="text-background/70 hover:text-primary transition-colors">العروض الأسبوعية</Link></li>
                <li><Link to="/support" className="text-background/70 hover:text-primary transition-colors">الدعم والمساعدة</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-bold mb-6">قانوني</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-background/70 hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
                <li><Link to="/terms" className="text-background/70 hover:text-primary transition-colors">الشروط والأحكام</Link></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">سياسة الإلغاء</a></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">الأسئلة الشائعة</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-6">تواصل معنا</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-background/60">اتصل بنا</p>
                    <p className="font-semibold">+966 50 123 4567</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-background/60">البريد الإلكتروني</p>
                    <p className="font-semibold">info@mashrouk.com</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-background/60">العنوان</p>
                    <p className="font-semibold">الرياض، المملكة العربية السعودية</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/60 text-sm">
              © 2024 مشروك. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-60" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 opacity-60" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button className="fixed bottom-6 left-6 w-14 h-14 hero-gradient rounded-full shadow-hover flex items-center justify-center animate-pulse-soft hover:scale-110 transition-transform z-50">
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>
    </footer>
  );
}
