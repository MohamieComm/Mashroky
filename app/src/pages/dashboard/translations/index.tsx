import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, AlertTriangle, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

const languages = [
  { code: "ar", name: "العربية", nativeName: "العربية", status: "اللغة الأساسية" },
  { code: "en", name: "English", nativeName: "English", status: "مفعلة" },
  { code: "fr", name: "French", nativeName: "Français", status: "مفعلة" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", status: "مفعلة" },
  { code: "ur", name: "Urdu", nativeName: "اردو", status: "مفعلة" },
];

export default function TranslationsIndex() {
  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 text-primary-foreground/80">
            <Globe className="w-6 h-6" />
            <span>لوحة إدارة الترجمات</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            اللغات المتاحة
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            إدارة النصوص والترجمات وتحديثها مباشرة من لوحة التحكم.
          </p>
        </div>
      </section>

      <section className="py-10 bg-background" dir="rtl">
        <div className="container mx-auto px-4 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">إدارة اللغات</h2>
              <p className="text-muted-foreground mt-2">
                اختر لغة لتعديل النصوص أو مراجعة النصوص الناقصة.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/dashboard/translations/search">
                  <Search className="w-4 h-4" />
                  بحث في النصوص
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/dashboard/translations/missing">
                  <AlertTriangle className="w-4 h-4" />
                  النصوص الناقصة
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {languages.map((lang) => (
              <Card key={lang.code} className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{lang.name}</CardTitle>
                    <Badge variant="secondary" className="uppercase">
                      {lang.code}
                    </Badge>
                  </div>
                  <CardDescription>{lang.nativeName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>الحالة:</span>
                    <span className="text-foreground font-semibold">{lang.status}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button asChild variant="hero" className="gap-2">
                    <Link to={`/dashboard/translations/edit?lang=${lang.code}`}>
                      <Pencil className="w-4 h-4" />
                      تعديل الترجمات
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
