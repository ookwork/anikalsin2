"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/format";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Product, ProductModel } from "@/generated/prisma/client";

type ProductWithModel = Product & { model: ProductModel | null };

function StockInput({ product }: { product: Product }) {
  const router = useRouter();
  const [value, setValue] = useState(product.stockCount.toString());
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const next = Number(value);
    if (!Number.isFinite(next) || next < 0 || next === product.stockCount) {
      setValue(product.stockCount.toString());
      return;
    }
    setSaving(true);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockCount: next }),
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <input
      type="number"
      min={0}
      value={value}
      disabled={saving}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      className="w-20 rounded-lg border border-burgundy/15 bg-ivory px-2 py-1 text-sm focus:border-burgundy focus:outline-none"
    />
  );
}

function ProductRow({
  product,
  onDeleteRequest,
}: {
  product: ProductWithModel;
  onDeleteRequest: (p: Product) => void;
}) {
  return (
    <tr className="border-b border-burgundy/5 last:border-0">
      <td className="px-5 py-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-rose-pale">
          {product.featuredImageUrl && (
            <Image src={product.featuredImageUrl} alt={product.name} fill className="object-cover" sizes="48px" />
          )}
        </div>
      </td>
      <td className="px-5 py-3 font-medium text-burgundy-dark">
        {product.name}
        {product.colorName && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-charcoal/60">
            <span
              className="h-3 w-3 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: product.colorHex ?? "#cccccc" }}
            />
            {product.colorName}
          </span>
        )}
      </td>
      <td className="px-5 py-3 text-charcoal/70">{formatPrice(product.price)}</td>
      <td className="px-5 py-3">
        <StockInput product={product} />
      </td>
      <td className="px-5 py-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            product.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          {product.isActive ? "Yayında" : "Pasif"}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-2">
          <Link href={`/admin/products/${product.id}`} className="rounded-lg p-2 text-burgundy hover:bg-rose-pale">
            <Pencil size={16} />
          </Link>
          <button
            onClick={() => onDeleteRequest(product)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductsTableShell({
  children,
  isEmpty,
}: {
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-burgundy/10 text-xs uppercase tracking-wide text-charcoal/50">
            <th className="px-5 py-3">Görsel</th>
            <th className="px-5 py-3">Ürün</th>
            <th className="px-5 py-3">Fiyat</th>
            <th className="px-5 py-3">Stok</th>
            <th className="px-5 py-3">Durum</th>
            <th className="px-5 py-3 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-charcoal/50">
                Henüz ürün eklenmemiş.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </Card>
  );
}

export default function ProductsTable({ products }: { products: ProductWithModel[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    setLoading(false);
    setDeleteTarget(null);
    router.refresh();
  };

  const modelGroups = new Map<string, { model: ProductModel; products: ProductWithModel[] }>();
  const standalone: ProductWithModel[] = [];

  for (const product of products) {
    if (product.model) {
      const entry = modelGroups.get(product.model.id);
      if (entry) entry.products.push(product);
      else modelGroups.set(product.model.id, { model: product.model, products: [product] });
    } else {
      standalone.push(product);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {[...modelGroups.values()].map(({ model, products: colorVariants }) => {
          const totalStock = colorVariants.reduce((sum, p) => sum + p.stockCount, 0);
          return (
            <div key={model.id}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-burgundy-dark">
                <Layers size={15} />
                {model.name}
                <span className="rounded-full bg-rose-pale px-2.5 py-0.5 text-xs font-medium text-burgundy">
                  Genel Stok: {totalStock} adet
                </span>
              </div>
              <ProductsTableShell isEmpty={false}>
                {colorVariants.map((p) => (
                  <ProductRow key={p.id} product={p} onDeleteRequest={setDeleteTarget} />
                ))}
              </ProductsTableShell>
            </div>
          );
        })}

        {(standalone.length > 0 || modelGroups.size === 0) && (
          <div>
            {modelGroups.size > 0 && (
              <p className="mb-2 text-sm font-semibold text-burgundy-dark">Tekil Ürünler</p>
            )}
            <ProductsTableShell isEmpty={products.length === 0}>
              {standalone.map((p) => (
                <ProductRow key={p.id} product={p} onDeleteRequest={setDeleteTarget} />
              ))}
            </ProductsTableShell>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Ürünü Sil"
        description={`"${deleteTarget?.name}" ürününü silmek istediğinize emin misiniz? Rezervasyonu olan ürünler pasif hale getirilir.`}
        confirmLabel="Sil"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
