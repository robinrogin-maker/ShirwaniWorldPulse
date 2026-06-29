import { LANGS, useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
            lang === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary"
          }`}
          aria-label={l.label}
          title={l.label}
        >
          <span className="me-1">{l.flag}</span>
          <span className="hidden sm:inline">{l.label}</span>
          <span className="sm:hidden uppercase">{l.code}</span>
        </button>
      ))}
    </div>
  );
}
