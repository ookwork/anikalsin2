"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { BlogPost } from "@/generated/prisma/client";

export default function BlogPostsTable({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    await fetch(`/api/admin/blog/${deleteTarget.id}`, { method: "DELETE" });
    setLoading(false);
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-burgundy/10 text-xs uppercase tracking-wide text-charcoal/50">
              <th className="px-5 py-3">Başlık</th>
              <th className="px-5 py-3">Durum</th>
              <th className="px-5 py-3">Tarih</th>
              <th className="px-5 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-charcoal/50">
                  Henüz yazı eklenmemiş.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-burgundy/5 last:border-0">
                <td className="px-5 py-3 font-medium text-burgundy-dark">{p.title}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      p.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.isPublished ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-5 py-3 text-charcoal/70">
                  {p.publishedAt ? formatDate(p.publishedAt) : formatDate(p.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/blog/${p.id}`} className="rounded-lg p-2 text-burgundy hover:bg-rose-pale">
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Yazıyı Sil"
        description={`"${deleteTarget?.title}" yazısını silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
