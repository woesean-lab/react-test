import { useMemo, useState } from "react"

const PERIODS = [
  { key: "day", label: "Gun" },
  { key: "week", label: "Hafta" },
  { key: "month", label: "Ay" },
  { key: "year", label: "Yil" },
]

const DATA = {
  day: [
    { label: "Pzt", value: 14 },
    { label: "Sal", value: 18 },
    { label: "Car", value: 23 },
    { label: "Per", value: 21 },
    { label: "Cum", value: 29 },
    { label: "Cts", value: 17 },
    { label: "Paz", value: 13 },
  ],
  week: [
    { label: "1.hafta", value: 96 },
    { label: "2.hafta", value: 122 },
    { label: "3.hafta", value: 134 },
    { label: "4.hafta", value: 118 },
  ],
  month: [
    { label: "Oca", value: 420 },
    { label: "Sub", value: 380 },
    { label: "Mar", value: 460 },
    { label: "Nis", value: 510 },
    { label: "May", value: 540 },
    { label: "Haz", value: 500 },
    { label: "Tem", value: 560 },
    { label: "Agu", value: 610 },
    { label: "Eyl", value: 590 },
    { label: "Eki", value: 640 },
    { label: "Kas", value: 620 },
    { label: "Ara", value: 670 },
  ],
  year: [
    { label: "2021", value: 4200 },
    { label: "2022", value: 5180 },
    { label: "2023", value: 6120 },
    { label: "2024", value: 7050 },
    { label: "2025", value: 7420 },
  ],
}

function buildPath(points, height) {
  if (points.length === 0) return ""
  const [first, ...rest] = points
  const path = [`M ${first.x} ${first.y}`]
  rest.forEach((pt) => path.push(`L ${pt.x} ${pt.y}`))
  return `${path.join(" ")} L ${points[points.length - 1].x} ${height} L ${first.x} ${height} Z`
}

function LineShape({ points }) {
  if (points.length === 0) return null
  const [first, ...rest] = points
  const d = [`M ${first.x} ${first.y}`, ...rest.map((pt) => `L ${pt.x} ${pt.y}`)].join(" ")
  return (
    <path
      d={d}
      fill="none"
      stroke="url(#chart-stroke)"
      strokeWidth="2.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  )
}

export default function SalesGraphTab({ panelClass }) {
  const [period, setPeriod] = useState("day")
  const currentData = DATA[period] || []
  const height = 220
  const paddingX = 4
  const maxValue = Math.max(...currentData.map((d) => d.value), 1)
  const points = useMemo(() => {
    const count = currentData.length
    const denom = Math.max(count - 1, 1)
    return currentData.map((item, index) => {
      const x = paddingX + (index / denom) * (100 - paddingX * 2)
      const y = height - (item.value / maxValue) * (height - 28)
      return { ...item, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }
    })
  }, [currentData, height, maxValue])

  const areaPath = buildPath(points, height)
  const total = currentData.reduce((sum, item) => sum + item.value, 0)
  const avg = Math.round(total / Math.max(currentData.length, 1))
  const peak =
    currentData.reduce((acc, item) => (item.value > acc.value ? item : acc), currentData[0] || {
      label: "-",
      value: 0,
    }) || { label: "-", value: 0 }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Satis grafigi</p>
          <h2 className="text-2xl font-semibold text-white">Durum ozetleri (mock veri)</h2>
          <p className="text-sm text-slate-400">
            Veritabanina baglanmadan sahte verilerle gun/hafta/ay/yil gosterimi.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-1">
          {PERIODS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                period === item.key
                  ? "bg-accent-500/20 text-accent-50 shadow-glow"
                  : "text-slate-200 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${panelClass} bg-ink-900/70`}>
        <div className="flex flex-wrap gap-3 text-sm text-slate-200">
          <div className="flex-1 min-w-[160px] rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Toplam</p>
            <p className="text-xl font-semibold text-white">{total.toLocaleString("tr-TR")}</p>
          </div>
          <div className="flex-1 min-w-[160px] rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Ortalama</p>
            <p className="text-xl font-semibold text-white">{avg.toLocaleString("tr-TR")}</p>
          </div>
          <div className="flex-1 min-w-[160px] rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Tepe nokta</p>
            <p className="text-xl font-semibold text-white">
              {peak.label} - {peak.value.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 via-white/0 to-white/5 px-4 py-3">
          <svg viewBox="0 0 100 240" className="h-[260px] w-full">
            <defs>
              <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
              </linearGradient>
              <linearGradient id="chart-stroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            {areaPath && <path d={areaPath} fill="url(#chart-fill)" opacity="0.7" />}
            <LineShape points={points} />
            {points.map((pt) => (
              <circle key={pt.label} cx={pt.x} cy={pt.y} r={1.5} fill="#fff" />
            ))}
            {points.map((pt) => (
              <text
                key={`${pt.label}-label`}
                x={pt.x}
                y={236}
                textAnchor="middle"
                fontSize="6.5"
                fill="rgba(226,232,240,0.72)"
              >
                {pt.label}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
