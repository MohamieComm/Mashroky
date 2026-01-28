import { useState } from "react";
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center">
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
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
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
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Shield className="w-5 h-5" />
                  لوحة التحكم
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
