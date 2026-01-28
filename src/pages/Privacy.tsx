import { Layout } from "@/components/layout/Layout";
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 hero-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
            <p className="text-muted-foreground">آخر تحديث: يناير 2024</p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-2xl p-8 shadow-card space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">مقدمة</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                نحن في مشروك نلتزم بحماية خصوصيتك. توضح هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك الشخصية عند استخدام خدماتنا. باستخدامك لمنصتنا، فإنك توافق على الممارسات الموضحة في هذه السياسة.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">المعلومات التي نجمعها</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>معلومات الحجز: تفاصيل الرحلات، الفنادق، تفضيلات السفر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>معلومات الدفع: تفاصيل البطاقة الائتمانية (مشفرة)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>بيانات الاستخدام: سجل التصفح، الأجهزة المستخدمة</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">كيف نستخدم معلوماتك</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>معالجة وتأكيد حجوزاتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>إرسال تحديثات وإشعارات متعلقة برحلاتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>تحسين تجربتك وتخصيص العروض</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>التواصل معك بشأن خدماتنا</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">حقوقك</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>الوصول إلى بياناتك الشخصية وتحديثها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>طلب حذف حسابك وبياناتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>إلغاء الاشتراك في الرسائل التسويقية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>تقديم شكوى للجهات المختصة</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">ملفات تعريف الارتباط (Cookies)</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك تعديل إعدادات المتصفح لرفض ملفات تعريف الارتباط، لكن قد يؤثر ذلك على بعض وظائف الموقع.
              </p>
            </div>

            <div className="bg-accent rounded-xl p-6">
              <h3 className="font-bold mb-2">تواصل معنا</h3>
              <p className="text-muted-foreground">
                لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر:
                <br />
                البريد الإلكتروني: privacy@mashrouk.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
