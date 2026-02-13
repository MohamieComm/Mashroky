import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSettings } from "@/data/adminStore";
import {
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  Send,
  Clock,
  CheckCircle,
} from "lucide-react";

const faqs = [
  {
    question: "كيف أحجز رحلة أو فندق؟",
    answer:
      "اختر الخدمة من القائمة الرئيسية، ثم حدّد الوجهة والتواريخ وعدد المسافرين، وبعدها اضغط على “إضافة للسلة” لإكمال الدفع.",
  },
  {
    question: "ما وسائل الدفع المتاحة؟",
    answer:
      "ندعم Apple Pay وSamsung Pay وبطاقات Visa وMastercard، كما يمكن إضافة مزودات أخرى من لوحة الإدارة عند الحاجة.",
  },
  {
    question: "هل يمكن تعديل الحجز؟",
    answer:
      "يمكن تعديل بعض الحجوزات حسب شروط المزوّد. تواصل معنا وسنراجع الخيارات المتاحة لك بأسرع وقت.",
  },
  {
    question: "كيف يتم استرجاع المبلغ؟",
    answer:
      "يتم الاسترجاع وفق سياسة المزود وخلال 7-14 يوم عمل في المتوسط بعد تأكيد الإلغاء.",
  },
  {
    question: "هل الأسعار تشمل الضرائب والرسوم؟",
    answer:
      "الأسعار المعروضة شاملة للضرائب الأساسية ما لم يُذكر غير ذلك في تفاصيل العرض.",
  },
  {
    question: "كيف أتواصل في الحالات العاجلة؟",
    answer:
      "يمكنك التواصل عبر واتساب أو الاتصال المباشر، وسيتولى الفريق متابعة الحالة فورًا.",
  },
];

export default function Support() {
  const { contactPhone, contactEmail, contactWhatsapp } = useAdminSettings();
  const whatsappNumber = contactWhatsapp || contactPhone || "+966542454094";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            كيف نساعدك؟
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            فريق مشروك جاهز للإجابة عن استفساراتك حول الحجوزات والدفع والعروض الموسمية.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card rounded-2xl p-8 shadow-card text-center hover:shadow-hover transition-all">
              <div className="w-16 h-16 hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">اتصل بنا</h3>
              <p className="text-muted-foreground mb-4">دعم مباشر خلال ساعات العمل</p>
              <p className="text-xl font-bold text-primary phone-field" dir="ltr">
                {contactPhone || "+966 54 245 4094"}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card text-center hover:shadow-hover transition-all">
              <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
              <p className="text-muted-foreground mb-4">نرد خلال 24 ساعة</p>
              <p className="text-xl font-bold text-primary phone-field" dir="ltr">
                {contactEmail || "ibrahemest@outlook.sa"}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-card text-center hover:shadow-hover transition-all">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">واتساب</h3>
              <p className="text-muted-foreground mb-4">رسالة سريعة</p>
              <Button variant="hero">ابدأ المحادثة</Button>
              <a
                className="block text-sm text-primary mt-3"
                href={`https://wa.me/${whatsappNumber.replace("+", "")}`}
                rel="noreferrer"
              >
                فتح واتساب في نافذة جديدة
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-card rounded-xl shadow-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-right hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-semibold">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          openFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-5 pb-5 text-muted-foreground animate-fade-up">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">تواصل معنا</h2>
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">الاسم</label>
                      <Input placeholder="الاسم الكامل" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label>
                      <Input type="email" placeholder="example@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">رقم الجوال</label>
                    <Input placeholder="+966 50 123 4567" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">نوع الاستفسار</label>
                    <select className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm">
                      <option>حجز جديد</option>
                      <option>تعديل الحجز</option>
                      <option>إلغاء الحجز</option>
                      <option>الدفع</option>
                      <option>الدعم الفني</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">الرسالة</label>
                    <Textarea placeholder="اكتب رسالتك هنا..." rows={5} />
                  </div>
                  <Button variant="hero" className="w-full gap-2">
                    <Send className="w-5 h-5" />
                    إرسال الطلب
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>متوسط وقت الرد: 2-4 ساعات</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>نسبة رضا العملاء: 98%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
