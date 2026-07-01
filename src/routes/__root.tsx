import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CATEGORY_LIST } from "@/lib/categories";

function NotFoundComponent() {
  return (
    <I18nProvider>
      <NotFoundInner />
    </I18nProvider>
  );
}

function NotFoundInner() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">{t("notFound")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("notFoundBody")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't load the page. Try again or return home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "World Spectrum — sports, politics, shopping, music, medicine & tourism" },
      {
        name: "description",
        content:
          "World Spectrum: a trilingual hub (Arabic, English, Swedish) for European football, world politics, home shopping, global music, medical tips and travel destinations.",
      },
      { property: "og:title", content: "World Spectrum" },
      {
        property: "og:description",
        content: "Trilingual global news, shopping, music, medicine & tourism.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@500;700;900&family=Inter:wght@400;600;700;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <div className="min-h-screen bg-grain">
          <SiteHeader />
          <Outlet />
          <SiteFooter />
        </div>
        <Toaster position="top-center" richColors />
      </I18nProvider>
    </QueryClientProvider>
  );
}

function SiteHeader() {
  const { lang, t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-black text-lg">
            w
          </span>
          <span className="text-2xl font-black text-gradient-gold tracking-tight">World Spectrum</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          <NavLink to="/">{t("home")}</NavLink>
          {CATEGORY_LIST.map((c) => (
            <NavLink key={c.key} to={`/${c.key}`}>
              {c.label[lang]}
            </NavLink>
          ))}
        </nav>
        <LanguageSwitcher />
      </div>
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 pb-3 text-sm font-semibold">
        <NavLink to="/">{t("home")}</NavLink>
        {CATEGORY_LIST.map((c) => (
          <NavLink key={c.key} to={`/${c.key}`}>
            {c.label[lang]}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground whitespace-nowrap"
      activeProps={{ className: "rounded-md px-3 py-2 bg-secondary text-primary whitespace-nowrap" }}
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 text-center text-sm text-muted-foreground">
        <div className="text-2xl font-black text-gradient-gold mb-2">World Spectrum</div>
        <p>© {new Date().getFullYear()} World Spectrum. {t("copyrightTail")}</p>
      </div>
    </footer>
  );
}
