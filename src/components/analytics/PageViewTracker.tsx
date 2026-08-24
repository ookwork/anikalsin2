"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_KEY = "ak_vid";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function sendDuration(id: string, startedAt: number) {
  const durationMs = Math.round(performance.now() - startedAt);
  const blob = new Blob([JSON.stringify({ id, durationMs })], { type: "application/json" });
  navigator.sendBeacon("/api/track/pageview/duration", blob);
}

/** Anonim sayfa görüntüleme ve sayfada geçirilen süre takibi. Sadece client-side üretilmiş rastgele
    bir ziyaretçi kimliği kullanır; kişisel veri toplamaz. Admin sayfalarında devre dışıdır. */
export default function PageViewTracker() {
  const pathname = usePathname();
  const activeRef = useRef<{ id: string; startedAt: number } | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    let cancelled = false;
    const startedAt = performance.now();

    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorId: getVisitorId() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.id) {
          activeRef.current = { id: data.id, startedAt };
        }
      })
      .catch(() => {});

    const handleLeave = () => {
      const active = activeRef.current;
      if (active) {
        sendDuration(active.id, active.startedAt);
        activeRef.current = null;
      }
    };

    window.addEventListener("pagehide", handleLeave);

    return () => {
      cancelled = true;
      window.removeEventListener("pagehide", handleLeave);
      handleLeave();
    };
  }, [pathname]);

  return null;
}
