import { useState } from "react"

const todayKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const formatDate = (value) => {
  if (!value) return ""
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}.${month}.${year}`
}

const currency = (value) => {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount)) return "0"
  return amount.toLocaleString("tr-TR")
}

const seedRecords = [
  { id: "acc-1", date: "2026-02-10", available: 12000, pending: 4200, note: "Gecen hafta" },
  { id: "acc-2", date: "2026-02-11", available: 13450, pending: 3800, note: "" },
  { id: "acc-3", date: "2026-02-12", available: 12800, pending: 5200, note: "Para cekimi" },
]

export default function AccountingTab({ panelClass, isLoading }) {
  const [records, setRecords] = useState(seedRecords)
  const [form, setForm] = useState({
    date: todayKey(),
    available: "",
    pending: "",
    note: "",
  })
  const [formError, setFormError] = useState("")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card sm:p-6">
          <div className="h-4 w-28 rounded-full bg-white/10" />
          <div className="mt-4 h-8 w-52 rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-white/10" />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-7 w-28 rounded-full bg-white/10" />
            <div className="h-7 w-24 rounded-full bg-white/10" />
          </div>
        </div>
        <div className={`${panelClass} bg-ink-900/60`}>
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="mt-4 h-24 w-full rounded-xl bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 p-4 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Muhasebe
            </span>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Gun Sonu Takibi
            </h1>
            <p className="max-w-2xl text-sm text-slate-200/80">
              Pazaryeri mevcut ve bekleyen bakiyelerini gun sonu girisiyle takip et.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-200">
              Mod: Local
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-200">
              Durum: Hazirlaniyor
            </span>
          </div>
        </div>
      </header>

      {(() => {
        const sorted = [...records].sort((a, b) => String(b.date).localeCompare(a.date))
        const latest = sorted[0]
        const previous = sorted[1]
        const availableDiff = latest && previous ? latest.available - previous.available : 0
        const pendingDiff = latest && previous ? latest.pending - previous.pending : 0
        const recent = sorted.slice(0, 10)

        const handleAdd = () => {
          const date = form.date.trim()
          const available = Number(form.available)
          const pending = Number(form.pending)
          if (!date || !Number.isFinite(available) || !Number.isFinite(pending)) {
            setFormError("Tarih, mevcut ve bekleyen bakiyeler zorunlu.")
            return
          }
          const next = {
            id: `acc-${Date.now()}`,
            date,
            available,
            pending,
            note: form.note.trim(),
          }
          setRecords((prev) => [next, ...prev])
          setForm((prev) => ({
            ...prev,
            available: "",
            pending: "",
            note: "",
          }))
          setFormError("")
        }

        return (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-4 shadow-card">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_20%_0%,rgba(16,185,129,0.2),transparent)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Mevcut bakiye
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">TL {currency(latest?.available ?? 0)}</p>
                  <p className="mt-1 text-xs text-slate-400">{latest ? formatDate(latest.date) : "Kayit yok"}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-4 shadow-card">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_20%_0%,rgba(244,63,94,0.2),transparent)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Bekleyen bakiye
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">TL {currency(latest?.pending ?? 0)}</p>
                  <p className="mt-1 text-xs text-slate-400">{latest ? "Guncel" : "Kayit yok"}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-4 shadow-card">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_20%_0%,rgba(59,130,246,0.2),transparent)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Gun farki
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {availableDiff >= 0 ? "+" : "-"}TL {currency(Math.abs(availableDiff))}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Bekleyen: {pendingDiff >= 0 ? "+" : "-"}TL {currency(Math.abs(pendingDiff))}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
              <div className={`${panelClass} bg-ink-900/60`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                      Gun sonu kayitlari
                    </p>
                    <p className="text-sm text-slate-400">Mevcut ve bekleyen bakiyeler.</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {recent.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-400">
                      Kayit bulunamadi.
                    </div>
                  ) : (
                    recent.map((item, index) => {
                      const prev = recent[index + 1]
                      const itemAvailableDiff = prev ? item.available - prev.available : 0
                      const itemPendingDiff = prev ? item.pending - prev.pending : 0
                      return (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-100">{formatDate(item.date)}</p>
                            <p className="text-xs text-slate-400">
                              Mevcut: TL {currency(item.available)} · Bekleyen: TL {currency(item.pending)}
                            </p>
                            {item.note ? (
                              <p className="mt-1 text-[11px] text-slate-500">{item.note}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-emerald-200">
                              {itemAvailableDiff >= 0 ? "+" : "-"}TL {currency(Math.abs(itemAvailableDiff))}
                            </p>
                            <p className="text-[11px] text-rose-200">
                              {itemPendingDiff >= 0 ? "+" : "-"}TL {currency(Math.abs(itemPendingDiff))}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className={`${panelClass} bg-ink-800/60`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                        Gun sonu girisi
                      </p>
                      <p className="text-sm text-slate-400">Mevcut ve bekleyen bakiyeleri gir.</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                      {records.length} kayit
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-ink-900/70 p-4 shadow-inner">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.available}
                        onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.value }))}
                        placeholder="Mevcut bakiye"
                        className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                      />
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.pending}
                        onChange={(e) => setForm((prev) => ({ ...prev, pending: e.target.value }))}
                        placeholder="Bekleyen bakiye"
                        className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100"
                      />
                    </div>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100"
                    />
                    <input
                      value={form.note}
                      onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      placeholder="Not (opsiyonel)"
                      className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                    />
                    {formError ? (
                      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                        {formError}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="w-full rounded-lg border border-emerald-400/70 bg-emerald-500/15 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-emerald-50 shadow-glow transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/25"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>

                <div className={`${panelClass} bg-ink-900/60`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">Ozet</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">Son kayit</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-200">
                      Mevcut: <span className="text-emerald-200">TL {currency(latest?.available ?? 0)}</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-200">
                      Bekleyen: <span className="text-rose-200">TL {currency(latest?.pending ?? 0)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Gunluk degisim</p>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2 text-xs text-slate-200">
                      <span>Mevcut fark</span>
                      <span className={availableDiff >= 0 ? "text-emerald-200" : "text-rose-200"}>
                        {availableDiff >= 0 ? "+" : "-"}TL {currency(Math.abs(availableDiff))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2 text-xs text-slate-200">
                      <span>Bekleyen fark</span>
                      <span className={pendingDiff >= 0 ? "text-emerald-200" : "text-rose-200"}>
                        {pendingDiff >= 0 ? "+" : "-"}TL {currency(Math.abs(pendingDiff))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}

