import { Layout } from "@/components/layout/Layout";
import { FileText, CheckCircle, AlertTriangle, Scale } from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
            الشروط والأحكام
          </h1>
          <p className="text-primary-foreground/80 mt-3">آخر تحديث: فبراير 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-3xl p-8 shadow-card space-y-8 text-muted-foreground leading-relaxed">
            <div>
              <div className="flex items-center gap-3 mb-3 text-foreground">
                <CheckCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">قبول الشروط</h2>
              </div>
              <p>
                باستخدامك لمنصة مشروك، فأنت تقر بموافقتك على هذه الشروط. إذا لم تكن موافقًا،
                يرجى عدم استخدام الموقع أو الخدمات.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3 text-foreground">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">مسؤوليات المستخدم</h2>
              </div>
              <ul className="space-y-2">
                <li>• إدخال بيانات صحيحة عند إنشاء الحساب أو الحجز.</li>
                <li>• الحفاظ على سرية بيانات الدخول وعدم مشاركتها.</li>
                <li>• الالتزام بسياسات المزودين والشركاء الخارجيين.</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3 text-foreground">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">المدفوعات والإلغاء</h2>
              </div>
              <ul className="space-y-2">
                <li>• تتم معالجة المدفوعات عبر بوابات دفع آمنة.</li>
                <li>• تختلف سياسات الإلغاء والاسترجاع حسب كل مزود.</li>
                <li>• قد تُطبق رسوم إدارية أو فروقات سعرية عند التعديل.</li>
              </ul>
            </div>

            <div className="bg-accent rounded-2xl p-6 text-foreground">
              <p>
                لأي استفسار حول الشروط والأحكام يمكنك التواصل مع فريق الدعم. سيتم تحديث هذه
                الصفحة عند الحاجة.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
