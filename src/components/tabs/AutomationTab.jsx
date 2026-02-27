function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
}

function AutomationSkeleton({ panelClass }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card sm:p-6">
        <SkeletonBlock className="h-4 w-28 rounded-full" />
        <SkeletonBlock className="mt-4 h-8 w-52" />
        <SkeletonBlock className="mt-3 h-4 w-2/3" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className={`${panelClass} bg-ink-900/60`}>
          <SkeletonBlock className="h-3 w-24 rounded-full" />
          <SkeletonBlock className="mt-3 h-4 w-44" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonBlock key={`automation-skeleton-${idx}`} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className={`${panelClass} bg-ink-900/60`}>
            <SkeletonBlock className="h-3 w-20 rounded-full" />
            <SkeletonBlock className="mt-3 h-16 w-full rounded-2xl" />
          </div>
          <div className={`${panelClass} bg-ink-900/60`}>
            <SkeletonBlock className="h-3 w-16 rounded-full" />
            <SkeletonBlock className="mt-3 h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AutomationTab({ panelClass, isLoading = false }) {
  if (isLoading) {
    return <AutomationSkeleton panelClass={panelClass} />
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-4 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
              Otomasyon
            </span>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Otomasyon
            </h1>
            <p className="max-w-2xl text-sm text-slate-200/80">
              DB bağlantısı gelene kadar otomasyon fikirlerini taslak olarak topla.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-accent-200">
              Durum: Taslak
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className={`${panelClass} relative overflow-hidden bg-ink-900/60`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_140%_at_0%_0%,rgba(59,130,246,0.18),transparent)]" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Otomasyon Calistir
                </p>
                <p className="mt-1 text-sm text-slate-300">Eklenen otomasyonu secip calistir.</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Hazir
              </span>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <select className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-slate-100 shadow-inner transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20">
                <option>Otomasyon sec</option>
                <option>Siparis onay otomasyonu</option>
                <option>Stok kontrol zinciri</option>
                <option>Problem eskalasyonu</option>
              </select>
              <button
                type="button"
                className="rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-emerald-50 shadow-glow transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/30"
              >
                Calistir
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-ink-950/60 px-4 py-4 text-sm text-slate-300 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Cikti
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Beklemede
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-ink-900/40 px-4 py-6 text-center text-xs text-slate-500">
                Cikti alani
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`${panelClass} relative overflow-hidden bg-ink-900/60`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_160%_at_100%_0%,rgba(34,197,94,0.12),transparent)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Websocket Baglanti Ayarlari
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Otomasyon bildirimleri icin websocket sunucu adresini gir.
            </p>
            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold text-slate-300" htmlFor="ws-url">
                Websocket URL
              </label>
              <input
                id="ws-url"
                type="text"
                placeholder="wss://ornek.com/ws"
                className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
              />
              <button
                type="button"
                className="w-full rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-emerald-50 shadow-glow transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/30"
              >
                Kaydet
              </button>
            </div>
          </div>

          <div className={`${panelClass} relative overflow-hidden bg-ink-900/60`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_0%_0%,rgba(14,165,233,0.12),transparent)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Yeni Otomasyon Ekle
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Baslik ve kullanilacak template yolunu belirt.
            </p>
            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold text-slate-300" htmlFor="automation-title">
                Otomasyon basligi
              </label>
              <input
                id="automation-title"
                type="text"
                placeholder="Otomasyon basligi"
                className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
              />
              <label className="text-xs font-semibold text-slate-300" htmlFor="automation-template">
                /templates
              </label>
              <input
                id="automation-template"
                type="text"
                placeholder="/templates/..."
                className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
              />
              <button
                type="button"
                className="w-full rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-emerald-50 shadow-glow transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/30"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
