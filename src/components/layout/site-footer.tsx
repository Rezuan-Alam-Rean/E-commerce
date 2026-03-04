export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            AURELIA COMMERCE 2026
          </p>
          <p className="mt-2 text-sm text-muted">
            Premium essentials delivered with confidence.
          </p>
        </div>
        <p className="text-xs text-muted">
          Support: support@aurelia.store
        </p>
      </div>
    </footer>
  );
}
