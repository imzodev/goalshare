import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("landing.footer");
  const tApp = await getTranslations("app");

  return (
    <footer className="border-t bg-gradient-to-r from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold bg-gradient-to-br from-primary via-indigo-500 to-accent bg-clip-text text-transparent">
                {tApp("name")}
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md leading-relaxed">{tApp("description")}</p>
            <p className="text-sm text-muted-foreground">{t("copyright")}</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">{t("productTitle")}</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link className="hover:text-primary transition-colors" href="#features">
                {t("features")}
              </Link>
              <Link className="hover:text-primary transition-colors" href="#pricing">
                {t("pricing")}
              </Link>
              <Link className="hover:text-primary transition-colors" href="#">
                {t("roadmap")}
              </Link>
              <Link className="hover:text-primary transition-colors" href="#">
                {t("changelog")}
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t("companyTitle")}</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link className="hover:text-primary transition-colors" href="#">
                {t("about")}
              </Link>
              <Link className="hover:text-primary transition-colors" href="#">
                {t("blog")}
              </Link>
              <Link className="hover:text-primary transition-colors" href="#">
                {t("contact")}
              </Link>
              <Link className="hover:text-primary transition-colors" href="#">
                {t("careers")}
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <Link className="hover:text-primary transition-colors" href="#">
              {t("privacy")}
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              {t("terms")}
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              {t("security")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
