import type { MetadataRoute } from "next";
import { env } from "@/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = new URL(env.NEXT_PUBLIC_APP_URL).toString().replace(/\/$/, "");
  const now = new Date().toISOString();
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Agrega más rutas públicas cuando existan (ej. /pricing, /docs)
  ];
}
