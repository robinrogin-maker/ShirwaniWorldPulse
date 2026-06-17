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

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            العودة للرئيسية
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
        <h1 className="text-xl font-semibold">حدث خطأ ما</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          لم نستطع تحميل الصفحة. حاول مرة أخرى أو عُد للرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            الرئيسية
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
      { title: "مزاج — بوابة أخبار الرياضة والسياسة والتسوق والموسيقى" },
      {
        name: "description",
        content:
          "مزاج: منصة شاملة لأخبار كرة القدم الأوروبية والمنتخبات، أخبار الشرق الأوسط، التسوق المنزلي، والموسيقى العالمية.",
      },
      { property: "og:title", content: "مزاج — بوابة أخبار الرياضة والسياسة والتسوق والموسيقى" },
      {
        property: "og:description",
        content: "أخبار رياضية، سياسية، تسوق منزلي وموسيقى عالمية بلمسة عربية أنيقة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "مزاج — بوابة أخبار الرياضة والسياسة والتسوق والموسيقى" },
      { name: "description", content: "Global Pulse Hub is a web application delivering curated global news and content." },
      { property: "og:description", content: "Global Pulse Hub is a web application delivering curated global news and content." },
      { name: "twitter:description", content: "Global Pulse Hub is a web application delivering curated global news and content." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/986bfe49-eb0c-4f6e-9086-063db826fe4f/id-preview-57439efc--87a94d6d-ca55-40e8-8919-a54280b87d83.lovable.app-1781597524768.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/986bfe49-eb0c-4f6e-9086-063db826fe4f/id-preview-57439efc--87a94d6d-ca55-40e8-8919-a54280b87d83.lovable.app-1781597524768.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@500;700;900&display=swap",
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
      <div className="min-h-screen bg-grain">
        <SiteHeader />
        <Outlet />
        <SiteFooter />
      </div>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-black text-lg">
            م
          </span>
          <span className="text-2xl font-black text-gradient-gold tracking-tight">مزاج</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          <NavLink to="/">الرئيسية</NavLink>
          <NavLink to="/sports">رياضة</NavLink>
          <NavLink to="/politics">سياسة</NavLink>
          <NavLink to="/shopping">تسوّق</NavLink>
          <NavLink to="/music">موسيقى</NavLink>
        </nav>
        <div className="text-xs text-muted-foreground hidden sm:block">
          كل ما يهمّك في مكان واحد
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-4 pb-3 text-sm font-semibold">
        <NavLink to="/">الرئيسية</NavLink>
        <NavLink to="/sports">رياضة</NavLink>
        <NavLink to="/politics">سياسة</NavLink>
        <NavLink to="/shopping">تسوّق</NavLink>
        <NavLink to="/music">موسيقى</NavLink>
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
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 text-center text-sm text-muted-foreground">
        <div className="text-2xl font-black text-gradient-gold mb-2">مزاج</div>
        <p>© {new Date().getFullYear()} مزاج. كل المحتوى يُجلب من مصادره الأصلية.</p>
      </div>
    </footer>
  );
}
