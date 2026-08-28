"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-ivory p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-burgundy-dark">{title}</h3>}
          <button type="button" onClick={onClose} className="ml-auto rounded-full p-1 text-charcoal/50 hover:bg-cream cursor-pointer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
