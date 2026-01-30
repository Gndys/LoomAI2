"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Logo } from "@/components/ui/logo";

export default function GlobalFooter() {
  const { t, locale } = useTranslation();
  const year = new Date().getFullYear();

  const sections = [
    {
      title: t.footer.sections.about.title,
      links: [
        { label: t.footer.sections.about.links.demos, href: `/${locale}/ai` },
        { label: t.footer.sections.about.links.pricing, href: `/${locale}/pricing` },
        { label: t.footer.sections.about.links.premium, href: `/${locale}/premium-features` },
        { label: t.footer.sections.about.links.updates, href: `/${locale}/new-features` },
      ],
    },
    {
      title: t.footer.sections.tools.title,
      links: [],
    },
  ];

  return (
    <footer className="mt-20 bg-background/90">
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo size="md" />
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              {t.footer.description}
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-2">
            {sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <p className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                  {section.title}
                </p>
                <div className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-border/40 pt-6 text-sm text-muted-foreground">
          {t.footer.copyright.replace('{year}', year.toString())}
        </div>
      </div>
    </footer>
  );
}
