import type { MetadataRoute } from "next";
import { env } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const sitemap = new URL("/sitemap.xml", env.NEXT_PUBLIC_APP_URL).toString();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap,
  };
}
