"use client";

import { useTranslation } from "@/hooks/use-translation";

export default function GlobalFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="py-6">
      <div className="container text-center text-sm text-muted-foreground">
        {t.footer.copyright.replace('{year}', year.toString())}
      </div>
    </footer>
  );
}
