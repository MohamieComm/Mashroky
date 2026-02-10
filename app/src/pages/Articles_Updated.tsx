import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CalendarDays, ArrowLeft, Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { defaultArticles, useAdminCollection } from "@/data/adminStore";

// ����� ������ ������ �����
export const travelTips = [
  {
    id: 1,
    title: "���� ��� ������ ���",
    category: "�����",
    readTime: "5 �����",
    views: 2450,
    date: "2026-02-04",
    author: "���� �������",
    image: "https://images.unsplash.com/photo-1512453391709-c5d2f4c5c5e0",
    excerpt: "���� ��� ���� ������ ������ ��� ���������� ������ �������� ������� �������� �������.",
    content: `
��� �� ���� ������� �������� �� ����� ������. ��� ��� ���� ����� ��� ���� ����� �� ����� ����� �������.

## ���� ����� �������

### ������ ��� ����
* ����� ����� ������ (20-30 ���� �����)
* ��� ����� �������� �������
* ��� ����� ������� ��������
* ��� ���������� ������ ������ ����� ������

### ����� ��� ������
* �� ���� �� ��� ��� 50 ���� �����
* ����� ����� ��� �� ������ ������
* ����� �������� ������

## ����� ����

1. **������**: ������ ������ �� ������ ������
2. **�������**: ����� ����� ������ �����
3. **�����**: ���� ������ �� �����
4. **�������**: ���� ������ �� ����� ������
    `
  },
  {
    id: 2,
    title: "����� ��� ������� ��������",
    category: "�����",
    readTime: "8 �����",
    views: 1823,
    date: "2026-02-02",
    author: "����� �������",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
    excerpt: "����� ���� ����� ���� ������� ������ ����� ������� ��� ���� ������ ���������.",
    content: `
��� ����� ���� �� ���� ���� ������� ����� �� �����. ���� ��� ������� �������:

## ����� ��� ���

### 1. ���� ������
- ���� ��� 4-6 ������ �� �����
- ���� ����� �� ��� ����

### 2. ���� �������
- ������ ����� ��������
- ���� �� ���������
- ���� ���������

### 3. ���� �� ���� ����
- �������� ��� ������� ������� ����
- ������� �������� ���� �����

### 4. ���� ���� ����� ���������
- ������ �� ������
- ������ �� ������� ��������
    `
  },
  {
    id: 3,
    title: "����� ����� ��������",
    category: "�������",
    readTime: "6 �����",
    views: 3156,
    date: "2026-02-01",
    author: "���� �������",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
    excerpt: "����� ����� ����� ������� �������� ���� ������� ��� ����� ��� ������.",
    content: `
������ �� ���� ���� ������� �������� ��� ����� ��� ���� �������.

## ������� ��������

### 1. ���� �����
- ���� �� �������
- �� ��� �� 6 ���� �� ����� �����

### 2. ��������
- ���� ������� ��������
- ���� ������� ������

### 3. �������
- ����� �������
- ����� ������� ������

### 4. ������ �������
- ��� ����� �����
- ������ ������
- ����� ��������
    `
  },
  {
    id: 4,
    title: "���� ������� �� ������",
    category: "����",
    readTime: "7 �����",
    views: 2789,
    date: "2026-01-30",
    author: "���� ������",
    image: "https://images.unsplash.com/photo-1504674900757-da26b07bfd83",
    excerpt: "������ ���� ������� ��� ����� ������� �������� �� ������.",
    content: `
������ ����� ������ ����� �� ������� ��������.

## ������� ������ ���

### ����� �������
- **���� �����**: ������ ��������
- **���� �����**: �������� �������
- **���� �������**: ������ �������

### ����� �������
- **���� ������**: ��������� ��������� �������
- **���� ����**: ������ ������ ������

### �������
- **���� ������**: ���� ������ �������
- **���� �������**: ����� ���� ����� �����
    `
  },
];

export default function Articles() {
  const [selectedArticle, setSelectedArticle] = useState<typeof travelTips[0] | null>(null);
  const latestArticles = useAdminCollection("articles", defaultArticles);

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80 text-lg">������� ���������</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            ������ ������ �����
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto text-lg">
            ���� ������� �������ɡ ������� ��������� ������ ������� ������ ��� ������.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            {/* Main Articles */}
            <div className="space-y-8">
              {selectedArticle ? (
                // Article Detail View
                <div className="bg-card rounded-2xl p-8 shadow-card">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-primary mb-6 hover:gap-3 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    ������ �������
                  </button>

                  <ImageWithFallback
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full h-96 object-cover rounded-xl mb-6"
                    fallbackQuery={selectedArticle.title}
                  />

                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedArticle.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(selectedArticle.date).toLocaleDateString("ar-SA")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {selectedArticle.readTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {selectedArticle.views.toLocaleString()} ���
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold mb-6">{selectedArticle.title}</h1>

                  <div className="prose prose-invert max-w-none text-foreground/90">
                    {selectedArticle.content.split("\n##").map((section, idx) => {
                      if (idx === 0) return <p key={idx} className="mb-6">{section}</p>;
                      const [title, ...rest] = section.split("\n");
                      return (
                        <div key={idx} className="mb-6">
                          <h2 className="text-2xl font-bold mb-4">{title}</h2>
                          {rest.map((line, i) => {
                            if (!line.trim()) return null;
                            if (line.startsWith("###")) {
                              return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace("###", "").trim()}</h3>;
                            }
                            if (line.startsWith("*")) {
                              return <li key={i} className="ml-6 list-disc">{line.replace("*", "").trim()}</li>;
                            }
                            if (line.startsWith("-")) {
                              return <li key={i} className="ml-6 list-disc">{line.replace("-", "").trim()}</li>;
                            }
                            if (line.startsWith("1.") || line.match(/^\d+\./)) {
                              return <li key={i} className="ml-6 list-decimal">{line.replace(/^\d+\.\s*/, "").trim()}</li>;
                            }
                            return <p key={i} className="mb-3">{line}</p>;
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Articles List View
                travelTips.map((article) => (
                  <div
                    key={article.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="grid md:grid-cols-[1fr_300px] gap-4">
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">
                            {article.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{article.readTime}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {new Date(article.date).toLocaleDateString("ar-SA")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.views}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-hidden h-48 md:h-auto">
                        <ImageWithFallback
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackQuery={`${article.category} ${article.title}`}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* ���� �������� ������ */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold mb-4">���� �������� ������</h3>
                <div className="space-y-4">
                  {travelTips
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((article, idx) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="pb-4 border-b border-border last:border-0 cursor-pointer hover:text-secondary transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg font-bold text-secondary">{idx + 1}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm group-hover:text-secondary transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {article.views} ���
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* ������ */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold mb-4">������</h3>
                <div className="flex flex-wrap gap-2">
                  {["�����", "�����", "�������", "����", "�����"].map((cat) => (
                    <button
                      key={cat}
                      className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}
