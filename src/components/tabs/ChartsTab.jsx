import { useMemo, useState } from "react"

const rangeOptions = [
  { key: "daily", label: "Gunluk", caption: "Son 7 gun" },
  { key: "weekly", label: "Haftalik", caption: "Son 8 hafta" },
  { key: "monthly", label: "Aylik", caption: "Son 12 ay" },
  { key: "yearly", label: "Yillik", caption: "Son 5 yil" },
]

const salesSeries = {
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
    Object.entries(salesSeries).map(([key, items]) => [
      key,
      items.map((item) => ({ ...item })),
    ]),
  )

const buildFlowChart = (values, width = 760, height = 180, padding = 22) => {
  if (!Array.isArray(values) || values.length === 0) {
    return { width, height, padding, path: "", areaPath: "", points: [], gridLines: [] }
  }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const innerHeight = height - padding * 2
  const points = values.map((value, index) => {
    const x = padding + index * step
    const y = padding + innerHeight - ((value - min) / range) * innerHeight
    return { x, y, value }
  })
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ")
  const areaPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    return padding + (innerHeight / 3) * index
  })
  return { width, height, padding, path, areaPath, points, gridLines }
}

const buildSparkPath = (values, width = 240, height = 64, padding = 6) => {
  if (!Array.isArray(values) || values.length === 0) {
    return { width, height, path: "", points: [] }
  }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const innerHeight = height - padding * 2
  const points = values.map((value, index) => {
    const x = padding + index * step
    const y = padding + innerHeight - ((value - min) / range) * innerHeight
    return { x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ")
  return { width, height, path, points }
}

const buildPreviousSeries = (values) => {
  if (!Array.isArray(values) || values.length === 0) return []
  return values.map((value, index) => Math.round(value * (0.82 + (index % 4) * 0.05)))
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
        <div className="mt-4 flex flex-wrap gap-2">
          <SkeletonBlock className="h-8 w-24 rounded-full" />
          <SkeletonBlock className="h-8 w-24 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-900/60`}>
            <SkeletonBlock className="h-4 w-40 rounded-full" />
            <SkeletonBlock className="mt-5 h-32 w-full rounded-2xl" />
            <SkeletonBlock className="mt-4 h-10 w-2/3 rounded-xl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`chart-skeleton-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <SkeletonBlock className="h-3 w-16 rounded-full" />
                <SkeletonBlock className="mt-3 h-6 w-24 rounded-full" />
                <SkeletonBlock className="mt-2 h-3 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-800/60`}>
            <SkeletonBlock className="h-4 w-32 rounded-full" />
            <SkeletonBlock className="mt-4 h-16 w-full rounded-2xl" />
            <SkeletonBlock className="mt-4 h-32 w-full rounded-2xl" />
          </div>
          <div className={`${panelClass} bg-ink-800/60`}>
            <SkeletonBlock className="h-4 w-32 rounded-full" />
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
  const flowChart = useMemo(() => buildFlowChart(values), [values])
  const previousValues = useMemo(() => buildPreviousSeries(values), [values])
  const spark = useMemo(() => buildSparkPath(values, 260, 72, 6), [values])
  const sparkPrev = useMemo(() => buildSparkPath(previousValues, 260, 72, 6), [previousValues])
  const trendValue = values.length > 1 ? values[values.length - 1] - values[0] : 0
  const trendPercent = values[0] ? Math.round((trendValue / values[0]) * 100) : 0
  const trendTone = getTrendTone(trendValue)
  const targetTotal = Math.round(summary.total * 1.12)
  const targetProgress = targetTotal ? Math.min(100, Math.round((summary.total / targetTotal) * 100)) : 0
  const topSpikes = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value).slice(0, 3)
  }, [data])
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
    setSeriesByRange((prev) => {
      const list = Array.isArray(prev[rangeMeta.key]) ? [...prev[rangeMeta.key]] : []
      const matchIndex = list.findIndex(
        (item) => (item.date || item.label) === dateValue,
      )
      const nextItem = { label: dateValue, value: amountValue, date: dateValue, custom: true }
      if (matchIndex >= 0) {
        list[matchIndex] = { ...list[matchIndex], ...nextItem }
      } else {
        list.push(nextItem)
      }
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
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
                Grafik
              </span>
              <span className="text-xs text-slate-400">Satis nabzi</span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">
                Satis tahtasi
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200/80">
                Haftalik, gunluk, aylik ve yillik satisi tek bir panelde izle. Veriler su an ornek
                akista.
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300/70">
                Donem ozeti
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {rangeMeta.caption}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-6">
              <div>
                <p className="text-3xl font-semibold text-slate-100">
                  {numberFormatter.format(summary.total)}
                </p>
                <p className="text-xs text-slate-400">Toplam satis</p>
              </div>
              <div className="relative">
                <svg viewBox="0 0 120 120" className="h-20 w-20">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#3ac7ff"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - targetProgress / 100)}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold text-slate-100">{targetProgress}%</span>
                  <span className="text-[10px] text-slate-400">Hedef</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${trendTone.badge}`}>
                {trendTone.label}
              </span>
              <span className={`text-sm font-semibold ${trendTone.className}`}>
                {trendTone.sign}
                {Math.abs(trendPercent)}%
              </span>
              <span className="text-xs text-slate-400">Ilk/son karsilasma</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <section className={`${panelClass} bg-ink-900/60`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                  Satis akisi
                </p>
                <p className="text-sm text-slate-400">Akis hizini ve degisimleri yakala.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                Ortalama: {numberFormatter.format(summary.average)}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/70 p-4 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Akis izi</span>
                <span>{rangeMeta.caption}</span>
              </div>
              <div className="mt-4">
                <svg
                  viewBox={`0 0 ${flowChart.width} ${flowChart.height}`}
                  className="h-44 w-full"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Satis akis grafigi"
                >
                  <defs>
                    <linearGradient id="flow-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3ac7ff" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#2b9fff" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="flow-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3ac7ff" />
                      <stop offset="100%" stopColor="#2b9fff" />
                    </linearGradient>
                  </defs>
                  {flowChart.gridLines.map((y, index) => (
                    <line
                      key={`flow-grid-${index}`}
                      x1={flowChart.padding}
                      x2={flowChart.width - flowChart.padding}
                      y1={y}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeDasharray="4 5"
                    />
                  ))}
                  {flowChart.areaPath && <path d={flowChart.areaPath} fill="url(#flow-area)" stroke="none" />}
                  {flowChart.path && (
                    <path d={flowChart.path} fill="none" stroke="url(#flow-line)" strokeWidth="3" />
                  )}
                  {flowChart.points.map((point, index) => {
                    const isLast = index === flowChart.points.length - 1
                    return (
                      <circle
                        key={`flow-point-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={isLast ? 4.6 : 3.4}
                        fill={isLast ? "#e2f5ff" : "#3ac7ff"}
                        opacity={isLast ? 1 : 0.75}
                      />
                    )
                  })}
                </svg>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.map((item, index) => (
                  <span
                    key={`${item.label}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        index === data.length - 1 ? "bg-accent-300 shadow-glow" : "bg-accent-400/80"
                      }`}
                    />
                    <span className="font-semibold text-slate-100">{item.label}</span>
                    <span className="text-slate-400">{numberFormatter.format(item.value)}</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Zirve</p>
              <p className="mt-2 text-xl font-semibold text-slate-100">
                {numberFormatter.format(summary.max)}
              </p>
              <p className="text-xs text-slate-400">En yuksek nokta</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Taban</p>
              <p className="mt-2 text-xl font-semibold text-slate-100">
                {numberFormatter.format(summary.min)}
              </p>
              <p className="text-xs text-slate-400">En dusuk nokta</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Hedef</p>
              <p className="mt-2 text-xl font-semibold text-slate-100">
                {numberFormatter.format(targetTotal)}
              </p>
              <p className="text-xs text-slate-400">Planlanan seviye</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className={`${panelClass} bg-ink-800/60`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                  Karsilastirma
                </p>
                <p className="text-xs text-slate-400">Onceki donemle karsilastirma</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {rangeMeta.caption}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-ink-900/50 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Su an</span>
                <span>Onceki</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <svg viewBox={`0 0 ${spark.width} ${spark.height}`} className="h-16 w-full">
                    <path d={spark.path} fill="none" stroke="#3ac7ff" strokeWidth="2.2" />
                  </svg>
                  <p className="text-xs text-slate-400">Guncel akim</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <svg viewBox={`0 0 ${sparkPrev.width} ${sparkPrev.height}`} className="h-16 w-full">
                    <path d={sparkPrev.path} fill="none" stroke="rgba(148,163,184,0.7)" strokeWidth="2" />
                  </svg>
                  <p className="text-xs text-slate-400">Onceki donem</p>
                </div>
              </div>
              <div className="mt-4">
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
              </div>
            </div>
          </section>

          <section className={`${panelClass} bg-ink-800/60`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                Satis girisi
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                Demo
              </span>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleEntrySubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>
              {entryError && (
                <div className="rounded-lg border border-rose-200/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                  {entryError}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
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

          <section className={`${panelClass} bg-ink-800/60`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                Zirve notlari
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                Top 3
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {topSpikes.map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-400">Satis zirvesi</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-100">
                      {numberFormatter.format(item.value)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-accent-400/80 to-accent-200/80"
                      style={{ width: `${Math.max(16, Math.round((item.value / summary.max) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
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
