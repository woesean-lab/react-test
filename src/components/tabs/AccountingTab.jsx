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
  {
    id: "acc-1",
    type: "income",
    title: "Satis - Paket A",
    category: "Satis",
    amount: 2400,
    date: "2026-02-10",
    note: "Hizli teslim",
  },
  {
    id: "acc-2",
    type: "expense",
    title: "Yazilim lisansi",
    category: "Operasyon",
    amount: 680,
    date: "2026-02-11",
    note: "Aylik",
  },
  {
    id: "acc-3",
    type: "income",
    title: "Satis - Paket B",
    category: "Satis",
    amount: 1750,
    date: "2026-02-12",
    note: "",
  },
  {
    id: "acc-4",
    type: "expense",
    title: "Reklam gideri",
    category: "Pazarlama",
    amount: 420,
    date: "2026-02-12",
    note: "Meta kampanya",
  },
]

export default function AccountingTab({ panelClass, isLoading }) {
  const [records, setRecords] = useState(seedRecords)
  const [form, setForm] = useState({
    type: "income",
    title: "",
    category: "",
    amount: "",
    date: todayKey(),
    note: "",
  })
  const [filter, setFilter] = useState({ type: "all", query: "" })
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
              Yerel Finans Takibi
            </h1>
            <p className="max-w-2xl text-sm text-slate-200/80">
              Bu alan local olarak calisacak. Veritabani baglantisi su an yok.
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
        const summary = records.reduce(
          (acc, item) => {
            const amount = Number(item.amount ?? 0)
            if (!Number.isFinite(amount)) return acc
            if (item.type === "income") acc.income += amount
            if (item.type === "expense") acc.expense += amount
            return acc
          },
          { income: 0, expense: 0 },
        )
        const balance = summary.income - summary.expense
        const currentMonth = todayKey().slice(0, 7)
        const monthTotals = records.reduce(
          (acc, item) => {
            if (String(item.date || "").slice(0, 7) !== currentMonth) return acc
            const amount = Number(item.amount ?? 0)
            if (!Number.isFinite(amount)) return acc
            if (item.type === "income") acc.income += amount
            if (item.type === "expense") acc.expense += amount
            return acc
          },
          { income: 0, expense: 0 },
        )
        const categories = records.reduce((acc, item) => {
          const key = item.category || "Diger"
          const amount = Number(item.amount ?? 0)
          if (!Number.isFinite(amount)) return acc
          acc[key] = (acc[key] ?? 0) + amount * (item.type === "expense" ? -1 : 1)
          return acc
        }, {})
        const filtered = records.filter((item) => {
          if (filter.type !== "all" && item.type !== filter.type) return false
          if (!filter.query) return true
          const q = filter.query.toLowerCase()
          return (
            item.title.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            String(item.note || "").toLowerCase().includes(q)
          )
        })
        const recent = [...filtered].sort((a, b) => String(b.date).localeCompare(a.date)).slice(0, 8)

        const handleAdd = () => {
          const title = form.title.trim()
          const category = form.category.trim()
          const date = form.date.trim()
          const amount = Number(form.amount)
          if (!title || !category || !date || !Number.isFinite(amount) || amount <= 0) {
            setFormError("Baslik, kategori, tarih ve tutar zorunlu.")
            return
          }
          const next = {
            id: `acc-${Date.now()}`,
            type: form.type,
            title,
            category,
            amount,
            date,
            note: form.note.trim(),
          }
          setRecords((prev) => [next, ...prev])
          setForm((prev) => ({
            ...prev,
            title: "",
            category: "",
            amount: "",
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
                    Toplam gelir
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">₺{currency(summary.income)}</p>
                  <p className="mt-1 text-xs text-slate-400">Tum kayitlar</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-4 shadow-card">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_20%_0%,rgba(244,63,94,0.2),transparent)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Toplam gider
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">₺{currency(summary.expense)}</p>
                  <p className="mt-1 text-xs text-slate-400">Tum kayitlar</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-4 shadow-card">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_20%_0%,rgba(59,130,246,0.2),transparent)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Net bakiye
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">₺{currency(balance)}</p>
                  <p className="mt-1 text-xs text-slate-400">Gelir - gider</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
              <div className={`${panelClass} bg-ink-900/60`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                      Kayitlar
                    </p>
                    <p className="text-sm text-slate-400">Son hareketler ve filtreleme.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filter.type}
                      onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value }))}
                      className="rounded-full border border-white/10 bg-ink-900/60 px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="all">Hepsi</option>
                      <option value="income">Gelir</option>
                      <option value="expense">Gider</option>
                    </select>
                    <input
                      value={filter.query}
                      onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
                      placeholder="Ara (baslik, kategori)"
                      className="rounded-full border border-white/10 bg-ink-900/60 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {recent.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-400">
                      Kayit bulunamadi.
                    </div>
                  ) : (
                    recent.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                          <p className="text-xs text-slate-400">
                            {item.category} · {formatDate(item.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-semibold ${
                              item.type === "income" ? "text-emerald-200" : "text-rose-200"
                            }`}
                          >
                            {item.type === "income" ? "+" : "-"}₺{currency(item.amount)}
                          </p>
                          {item.note ? (
                            <p className="text-[11px] text-slate-500">{item.note}</p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className={`${panelClass} bg-ink-800/60`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                        Yeni kayit
                      </p>
                      <p className="text-sm text-slate-400">Gelir veya gider ekle.</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                      {records.length} kayit
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-ink-900/70 p-4 shadow-inner">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "income", label: "Gelir" },
                        { id: "expense", label: "Gider" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, type: item.id }))}
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                            form.type === item.id
                              ? "bg-emerald-400 text-ink-900"
                              : "border border-white/10 bg-white/5 text-slate-200"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Baslik"
                      className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                    />
                    <input
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="Kategori"
                      className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.amount}
                        onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="Tutar"
                        className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                      />
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100"
                      />
                    </div>
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
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                      Aylik ozet
                    </p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {todayKey().slice(0, 7)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-200">
                      Gelir: <span className="text-emerald-200">₺{currency(monthTotals.income)}</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-200">
                      Gider: <span className="text-rose-200">₺{currency(monthTotals.expense)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Kategori dagilimi
                    </p>
                    {Object.keys(categories).length === 0 ? (
                      <p className="text-xs text-slate-500">Kategori bulunamadi.</p>
                    ) : (
                      Object.entries(categories)
                        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2 text-xs text-slate-200"
                          >
                            <span>{key}</span>
                            <span className={value >= 0 ? "text-emerald-200" : "text-rose-200"}>
                              {value >= 0 ? "+" : "-"}₺{currency(Math.abs(value))}
                            </span>
                          </div>
                        ))
                    )}
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
