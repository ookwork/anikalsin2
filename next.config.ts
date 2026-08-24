import type { NextConfig } from "next";
import { LEGACY_BLOG_ROOT_ROUTES, LEGACY_BLOG_REWRITES } from "./src/lib/legacyBlogRoutes.ts";

const nextConfig: NextConfig = {
  output: "standalone",
  // Bazı paylaşımlı hostinglerde hesap başına işlem (process) sayısı sınırlıdır;
  // Next.js'in ek worker süreçleri başlatmasını (jest-worker/spawn EAGAIN hatası) önlemek için tek CPU'ya sabitliyoruz.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return Object.entries(LEGACY_BLOG_ROOT_ROUTES).map(([slug, destination]) => ({
      source: `/blog/${slug}`,
      destination,
      permanent: true,
    }));
  },
  async rewrites() {
    return Object.entries(LEGACY_BLOG_REWRITES).map(([source, destination]) => ({
      source,
      destination,
    }));
  },
};

export default nextConfig;
