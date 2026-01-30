import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Hotel, 
  Tag, 
  User, 
  Menu, 
  X, 
  MessageCircle,
  Home,
  Shield
} from "lucide-react";

const navItems = [
  { name: "الرئيسية", path: "/", icon: Home },
  { name: "الرحلات", path: "/trips", icon: Plane },
  { name: "الفنادق", path: "/hotels", icon: Hotel },
  { name: "العروض", path: "/offers", icon: Tag },
  { name: "حسابي", path: "/profile", icon: User },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                <Plane className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">مشروك</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="w-4 h-4" />
                  لوحة التحكم
                </Button>
              </Link>
              <Button variant="hero" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                تواصل معنا
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 z-50 relative"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Using Sheet/Drawer pattern */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Slide-in Menu */}
        <div 
          className={`absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-card shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Close button inside menu */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-bold text-lg text-gradient">مشروك</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-3"
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              <div className="h-px bg-border my-2" />
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Shield className="w-5 h-5" />
                  لوحة التحكم
                </Button>
              </Link>
              <Button variant="hero" className="w-full justify-start gap-3 mt-2">
                <MessageCircle className="w-5 h-5" />
                تواصل معنا
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
