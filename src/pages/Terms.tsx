import { Layout } from "@/components/layout/Layout";
import { FileText, Check, AlertCircle, Ban, Scale, RefreshCcw } from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 hero-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">الشروط والأحكام</h1>
            <p className="text-muted-foreground">آخر تحديث: يناير 2024</p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-2xl p-8 shadow-card space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">القبول بالشروط</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                باستخدامك لموقع وخدمات مشروك، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">شروط الحجز</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>يجب أن يكون عمر المستخدم 18 عاماً أو أكثر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>جميع المعلومات المقدمة يجب أن تكون صحيحة ودقيقة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>الأسعار المعروضة قابلة للتغيير حتى إتمام عملية الدفع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>تأكيد الحجز مرهون بتوفر الخدمة وإتمام الدفع</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <RefreshCcw className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">سياسة الإلغاء والاسترداد</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>تختلف سياسات الإلغاء حسب نوع الخدمة ومقدمها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>يتم خصم رسوم إدارية عند الإلغاء في بعض الحالات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>المبالغ المستردة تعود بنفس طريقة الدفع الأصلية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>مدة الاسترداد: 5-14 يوم عمل حسب البنك</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">المسؤولية</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>مشروك وسيط بين المستخدم ومقدمي الخدمات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>لا نتحمل المسؤولية عن الأحداث خارجة عن السيطرة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>يتحمل المستخدم مسؤولية التأكد من صحة وثائق السفر</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Ban className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">الأنشطة المحظورة</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>استخدام المنصة لأغراض غير قانونية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>انتحال هوية شخص أو جهة أخرى</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>محاولة اختراق أو تعطيل الموقع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>إساءة استخدام العروض والخصومات</span>
                </li>
              </ul>
            </div>

            <div className="bg-accent rounded-xl p-6">
              <h3 className="font-bold mb-2">التعديلات</h3>
              <p className="text-muted-foreground">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار على الموقع.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
