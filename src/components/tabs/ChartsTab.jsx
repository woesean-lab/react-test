import { useMemo, useState } from "react"

const rangeOptions = [
  { key: "daily", label: "Gunluk", caption: "Son 7 gun" },
  { key: "weekly", label: "Haftalik", caption: "Son 8 hafta" },
  { key: "monthly", label: "Aylik", caption: "Son 12 ay" },
  { key: "yearly", label: "Yillik", caption: "Son 5 yil" },
]

const baseSeries = {
  daily: [
    { label: "Pzt", value: 3200 },
    { label: "Sal", value: 2800 },
    { label: "Car", value: 3600 },
    { label: "Per", value: 4200 },
    { label: "Cum", value: 3900 },
    { label: "Cmt", value: 4600 },
    { label: "Paz", value: 5200 },
  ],
  weekly: [
    { label: "H1", value: 18500 },
    { label: "H2", value: 20100 },
    { label: "H3", value: 17600 },
    { label: "H4", value: 21400 },
    { label: "H5", value: 22800 },
    { label: "H6", value: 19650 },
    { label: "H7", value: 23550 },
    { label: "H8", value: 24800 },
  ],
  monthly: [
    { label: "Oca", value: 84000 },
    { label: "Sub", value: 91000 },
    { label: "Mar", value: 88500 },
    { label: "Nis", value: 97200 },
    { label: "May", value: 105400 },
    { label: "Haz", value: 99200 },
    { label: "Tem", value: 112300 },
    { label: "Agu", value: 118900 },
    { label: "Eyl", value: 107700 },
    { label: "Eki", value: 121400 },
    { label: "Kas", value: 126800 },
    { label: "Ara", value: 139200 },
  ],
  yearly: [
    { label: "2021", value: 860000 },
    { label: "2022", value: 940000 },
    { label: "2023", value: 1015000 },
    { label: "2024", value: 1132000 },
    { label: "2025", value: 1245000 },
  ],
}

const createSeriesState = () =>
  Object.fromEntries(
    Object.entries(baseSeries).map(([key, items]) => [
      key,
      items.map((item) => ({ ...item })),
    ]),
  )

const formatRangeLabel = (dateString, rangeKey) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  if (rangeKey === "daily") return `${month}/${day}`
  if (rangeKey === "monthly") return `${year}-${month}`
  if (rangeKey === "yearly") return String(year)
  const start = new Date(year, 0, 1)
  const diff = Math.floor((date - start) / 86400000) + start.getDay()
  const week = Math.ceil((diff + 1) / 7)
  return `H${week}`
}

const buildTrackChart = (values, width = 760, height = 210, padding = 26) => {
  if (!Array.isArray(values) || values.length === 0) {
    return { width, height, padding, baseline: height - padding, points: [], gridLines: [] }
  }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const baseline = height - padding
  const points = values.map((value, index) => {
    const x = padding + index * step
    const y = padding + (1 - (value - min) / range) * (baseline - padding)
    return { x, y, value }
  })
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    return padding + ((baseline - padding) / 3) * index
  })
  return { width, height, padding, baseline, points, gridLines }
}

const buildIntensity = (values) => {
  if (!Array.isArray(values) || values.length === 0) return []
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)
  return values.map((value) => {
    const ratio = (value - min) / range
    if (ratio > 0.75) return "bg-accent-500/80"
    if (ratio > 0.55) return "bg-accent-400/70"
    if (ratio > 0.35) return "bg-accent-200/50"
    return "bg-white/10"
  })
}

const getTrendTone = (value) => {
  if (value >= 0) {
    return {
      label: "Yukselis",
      className: "text-emerald-200",
      badge: "border-emerald-300/50 bg-emerald-500/15 text-emerald-100",
      sign: "+",
    }
  }
  return {
    label: "Dususte",
    className: "text-rose-200",
    badge: "border-rose-300/50 bg-rose-500/15 text-rose-100",
    sign: "",
  }
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
}

function ChartsSkeleton({ panelClass }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
        <SkeletonBlock className="h-4 w-24 rounded-full" />
        <SkeletonBlock className="mt-4 h-9 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-900/60`}>
            <SkeletonBlock className="h-4 w-40 rounded-full" />
            <SkeletonBlock className="mt-5 h-24 w-full rounded-2xl" />
          </div>
          <div className={`${panelClass} bg-ink-900/60`}>
            <SkeletonBlock className="h-4 w-32 rounded-full" />
            <SkeletonBlock className="mt-4 h-20 w-full rounded-2xl" />
          </div>
        </div>
        <div className={`${panelClass} bg-ink-900/60`}>
          <SkeletonBlock className="h-4 w-40 rounded-full" />
          <SkeletonBlock className="mt-4 h-40 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-900/60`}>
            <SkeletonBlock className="h-4 w-32 rounded-full" />
            <SkeletonBlock className="mt-4 h-16 w-full rounded-2xl" />
          </div>
          <div className={`${panelClass} bg-ink-900/60`}>
            <SkeletonBlock className="h-4 w-28 rounded-full" />
            <SkeletonBlock className="mt-4 h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChartsTab({ isLoading, panelClass }) {
  const [range, setRange] = useState("weekly")
  const [seriesByRange, setSeriesByRange] = useState(() => createSeriesState())
  const [entryDate, setEntryDate] = useState("")
  const [entryValue, setEntryValue] = useState("")
  const [entryError, setEntryError] = useState("")
  const rangeMeta = rangeOptions.find((option) => option.key === range) || rangeOptions[0]
  const data = seriesByRange[rangeMeta.key] || []
  const numberFormatter = useMemo(() => new Intl.NumberFormat("tr-TR"), [])
  const values = useMemo(() => data.map((item) => item.value), [data])
  const summary = useMemo(() => {
    if (values.length === 0) return { total: 0, average: 0, max: 0, min: 0 }
    const total = values.reduce((acc, value) => acc + value, 0)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const average = Math.round(total / values.length)
    return { total, average, max, min }
  }, [values])
  const chart = useMemo(() => buildTrackChart(values), [values])
  const intensity = useMemo(() => buildIntensity(values), [values])
  const trendValue = values.length > 1 ? values[values.length - 1] - values[0] : 0
  const trendPercent = values[0] ? Math.round((trendValue / values[0]) * 100) : 0
  const trendTone = getTrendTone(trendValue)
  const recentEntries = useMemo(() => [...data].slice(-5).reverse(), [data])
  const targetTotal = Math.round(summary.total * 1.14)
  const targetProgress = targetTotal ? Math.min(100, Math.round((summary.total / targetTotal) * 100)) : 0

  const handleEntrySubmit = (event) => {
    event.preventDefault()
    const dateValue = String(entryDate || "").trim()
    const amountValue = Number(entryValue)
    if (!dateValue) {
      setEntryError("Tarih gerekli.")
      return
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setEntryError("Satis miktari gecerli olmali.")
      return
    }
    setEntryError("")
    const label = formatRangeLabel(dateValue, rangeMeta.key) || dateValue
    setSeriesByRange((prev) => {
      const list = Array.isArray(prev[rangeMeta.key]) ? [...prev[rangeMeta.key]] : []
      list.push({ label, value: amountValue, date: dateValue, custom: true })
      return { ...prev, [rangeMeta.key]: list }
    })
    setEntryValue("")
  }

  if (isLoading) {
    return <ChartsSkeleton panelClass={panelClass} />
  }

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/80 p-6 shadow-card">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-sky-300/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
              Grafik
            </span>
            <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">
              Satis laboratuvari
            </h1>
            <p className="max-w-2xl text-sm text-slate-200/80">
              Akisi sekillendir, topladigin veriyi katmanlar halinde izle. Demo veri uzerinde calisir.
            </p>
          </div>
          <div className="inline-flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {rangeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  range === option.key
                    ? "bg-accent-500/20 text-accent-50 shadow-glow"
                    : "text-slate-300 hover:bg-white/10"
                }`}
                aria-pressed={range === option.key}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <section className={`${panelClass} bg-ink-900/60`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                Satis girisi
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {rangeMeta.caption}
              </span>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleEntrySubmit}>
              <label className="space-y-1 text-xs font-semibold text-slate-200">
                Tarih
                <input
                  type="date"
                  value={entryDate}
                  onChange={(event) => {
                    setEntryDate(event.target.value)
                    if (entryError) setEntryError("")
                  }}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-200">
                Satis miktari
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={entryValue}
                  onChange={(event) => {
                    setEntryValue(event.target.value)
                    if (entryError) setEntryError("")
                  }}
                  placeholder="0"
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                />
              </label>
              {entryError && (
                <div className="rounded-lg border border-rose-200/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                  {entryError}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Kayit secili doneme eklenir.</p>
                <button
                  type="submit"
                  className="rounded-full border border-accent-400/70 bg-accent-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-50 shadow-glow transition hover:-translate-y-0.5 hover:border-accent-300"
                >
                  Ekle
                </button>
              </div>
            </form>
          </section>

          <section className={`${panelClass} bg-ink-900/60`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                Son girisler
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {recentEntries.length} kayit
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {recentEntries.map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{item.date || item.label}</p>
                      <p className="text-xs text-slate-400">Etiket: {item.label}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-100">
                      {numberFormatter.format(item.value)}
                    </span>
                  </div>
                </div>
              ))}
              {recentEntries.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-xs text-slate-400">
                  Henuz giris yok.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className={`${panelClass} bg-ink-900/60`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                Akis rotasi
              </p>
              <p className="text-xs text-slate-400">Lollipop izleri ile akisi oku.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                Ortalama: {numberFormatter.format(summary.average)}
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${trendTone.badge}`}>
                {trendTone.label} {trendTone.sign}{Math.abs(trendPercent)}%
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/70 p-4 shadow-inner">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="h-48 w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label="Satis akis grafigi"
            >
              <defs>
                <linearGradient id="track-stem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ac7ff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#2b9fff" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {chart.gridLines.map((y, index) => (
                <line
                  key={`track-grid-${index}`}
                  x1={chart.padding}
                  x2={chart.width - chart.padding}
                  y1={y}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 5"
                />
              ))}
              <line
                x1={chart.padding}
                x2={chart.width - chart.padding}
                y1={chart.baseline}
                y2={chart.baseline}
                stroke="rgba(255, 255, 255, 0.12)"
              />
              {chart.points.map((point, index) => (
                <g key={`track-point-${index}`}>
                  <line
                    x1={point.x}
                    x2={point.x}
                    y1={chart.baseline}
                    y2={point.y}
                    stroke="url(#track-stem)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={index === chart.points.length - 1 ? 6 : 4.5}
                    fill={index === chart.points.length - 1 ? "#e2f5ff" : "#3ac7ff"}
                    stroke="rgba(15, 22, 37, 0.8)"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {data.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
              >
                <span className={`h-2 w-2 rounded-full ${index === data.length - 1 ? "bg-accent-300 shadow-glow" : "bg-accent-400/80"}`} />
                <span className="font-semibold text-slate-100">{item.label}</span>
                <span className="text-slate-400">{numberFormatter.format(item.value)}</span>
              </span>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className={`${panelClass} bg-ink-900/60`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                Sinyal paneli
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                Hedef
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Toplam</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">
                  {numberFormatter.format(summary.total)}
                </p>
                <p className="text-xs text-slate-400">Secili donem</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Hedef ilerleme</span>
                  <span>{targetProgress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-accent-400 via-sky-300 to-accent-500"
                    style={{ width: `${targetProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Hedef: {numberFormatter.format(targetTotal)}
                </p>
              </div>
            </div>
          </section>

          <section className={`${panelClass} bg-ink-900/60`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                Isi seridi
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                Dagilim
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(values.length, 12))}, minmax(0, 1fr))` }}
              >
                {intensity.map((tone, index) => (
                  <div key={`heat-${index}`} className={`h-6 rounded-lg ${tone}`} />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Dusuk</span>
                <span>Yuksek</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Demo veri kullaniyoruz, DB baglantisi acilmadi.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
