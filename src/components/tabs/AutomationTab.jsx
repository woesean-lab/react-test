import { useState } from "react"

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
  const [automations, setAutomations] = useState([
    { id: "auto-1", title: "Siparis onay otomasyonu", template: "/templates/order-confirm" },
    { id: "auto-2", title: "Stok kontrol zinciri", template: "/templates/stock-check" },
    { id: "auto-3", title: "Problem eskalasyonu", template: "/templates/problem-escalation" },
  ])
  const [automationForm, setAutomationForm] = useState({ title: "", template: "" })
  const [editingId, setEditingId] = useState("")
  const [editingDraft, setEditingDraft] = useState({ title: "", template: "" })
  const [selectedAutomationId, setSelectedAutomationId] = useState("")
  const [runLog, setRunLog] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRunId, setLastRunId] = useState("")
  const [templateWarning, setTemplateWarning] = useState("")

  const filteredAutomations = automations

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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className={`${panelClass} bg-ink-900/60`}>
          <div>
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
              <select
                value={selectedAutomationId}
                onChange={(event) => setSelectedAutomationId(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
              >
                <option value="">Otomasyon sec</option>
                {filteredAutomations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedAutomationId || isRunning}
                onClick={() => {
                  if (!selectedAutomationId || isRunning) return
                  const selected = automations.find((item) => item.id === selectedAutomationId)
                  if (!selected) return
                  const now = new Date()
                  const time = now.toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  setIsRunning(true)
                  setLastRunId(selectedAutomationId)
                  setRunLog((prev) => [
                    {
                      id: `log-${Date.now()}`,
                      time,
                      status: "running",
                      message: `${selected.title} calisiyor...`,
                    },
                    ...prev,
                  ])
                  window.setTimeout(() => {
                    const doneTime = new Date().toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    setRunLog((prev) => [
                      {
                        id: `log-${Date.now()}-done`,
                        time: doneTime,
                        status: "success",
                        message: `${selected.title} tamamlandi.`,
                      },
                      ...prev,
                    ])
                    setIsRunning(false)
                  }, 1200)
                }}
                className="rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/30"
              >
                {isRunning ? "Calisiyor..." : "Calistir"}
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Cikti
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {lastRunId ? "Son calistirildi" : "Beklemede"}
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {runLog.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-ink-900 px-4 py-4 text-center text-xs text-slate-500">
                    Cikti alani
                  </div>
                ) : (
                  runLog.slice(0, 4).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900 px-4 py-2 text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            entry.status === "success"
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                        />
                        <span>{entry.message}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{entry.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`${panelClass} bg-ink-900/60`}>
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
                className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
              />
              <button
                type="button"
                className="w-full rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/30"
              >
                Kaydet
              </button>
            </div>
          </div>

          <div className={`${panelClass} bg-ink-900/60`}>
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
                value={automationForm.title}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
              />
              <label className="text-xs font-semibold text-slate-300" htmlFor="automation-template">
                /templates
              </label>
              <input
                id="automation-template"
                type="text"
                placeholder="/templates/..."
                value={automationForm.template}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, template: event.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
              />
              {templateWarning ? (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  {templateWarning}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  const title = automationForm.title.trim()
                  const template = automationForm.template.trim()
                  if (!title || !template) return
                  if (!template.startsWith("/templates/")) {
                    setTemplateWarning("Template yolu /templates/ ile baslamali.")
                    return
                  }
                  setTemplateWarning("")
                  setAutomations((prev) => [
                    { id: `auto-${Date.now()}`, title, template },
                    ...prev,
                  ])
                  setAutomationForm({ title: "", template: "" })
                }}
                className="w-full rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/30"
              >
                Kaydet
              </button>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Duzenle / Sil
                </p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {automations.length} kayit
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">Basit duzenleme ve silme alani.</p>
              <div className="mt-4 space-y-3">
                <select
                  value={editingId}
                  onChange={(event) => {
                    const value = event.target.value
                    setEditingId(value)
                    const selected = automations.find((entry) => entry.id === value)
                    setEditingDraft({
                      title: selected?.title ?? "",
                      template: selected?.template ?? "",
                    })
                  }}
                  className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
                >
                  <option value="">Otomasyon sec</option>
                  {filteredAutomations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editingDraft.title}
                  onChange={(event) =>
                    setEditingDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Otomasyon basligi"
                  className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
                />
                <input
                  type="text"
                  value={editingDraft.template}
                  onChange={(event) =>
                    setEditingDraft((prev) => ({ ...prev, template: event.target.value }))
                  }
                  placeholder="/templates/..."
                  className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 hover:border-white/20"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const title = editingDraft.title.trim()
                      const template = editingDraft.template.trim()
                      if (!editingId || !title || !template) return
                      setAutomations((prev) =>
                        prev.map((entry) =>
                          entry.id === editingId ? { ...entry, title, template } : entry,
                        ),
                      )
                    }}
                    className="flex-1 rounded-lg border border-emerald-400/70 bg-emerald-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/30"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingId) return
                      setAutomations((prev) => prev.filter((entry) => entry.id !== editingId))
                      setEditingId("")
                      setEditingDraft({ title: "", template: "" })
                    }}
                    className="flex-1 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-100 transition hover:border-rose-400/70 hover:bg-rose-500/20"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
