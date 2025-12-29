export default function DashboardTab({
  panelClass,
  activeUser,
  templateCountText,
  categoryCountText,
  taskStats,
  salesSummary,
  listCountText,
  stockSummary,
  openProblems,
  resolvedProblems,
  canViewMessages,
  canViewTasks,
  canViewSales,
  canViewProblems,
  canViewLists,
  canViewStock,
  onNavigate,
}) {
  const summary = salesSummary || { total: 0, count: 0, average: 0, last7Total: 0 }
  const tasks = taskStats || { total: 0, todo: 0, doing: 0, done: 0 }
  const openCount = Array.isArray(openProblems) ? openProblems.length : 0
  const resolvedCount = Array.isArray(resolvedProblems) ? resolvedProblems.length : 0
  const stocks = stockSummary || { total: 0, used: 0, empty: 0 }
  const userName = activeUser?.username || "Kullanici"
  const userRole = activeUser?.role?.name || "Personel"
  const permissionCount = Array.isArray(activeUser?.role?.permissions)
    ? activeUser.role.permissions.length
    : 0
  const moduleCount = [
    canViewMessages,
    canViewTasks,
    canViewSales,
    canViewProblems,
    canViewLists,
    canViewStock,
  ].filter(Boolean).length
  const userInitial = userName.slice(0, 1).toUpperCase() || "K"
  const activeTaskCount = tasks.todo + tasks.doing
  const stockUsage = stocks.total > 0 ? Math.round((stocks.used / stocks.total) * 100) : 0
  const chartRaw = [
    summary.last7Total,
    summary.average,
    tasks.todo,
    tasks.doing,
    tasks.done,
    stocks.used,
    stocks.empty,
  ]
  const fallbackSeries = [8, 14, 10, 18, 13, 20, 16]
  const series = chartRaw.some((value) => value > 0) ? chartRaw : fallbackSeries
  const minValue = Math.min(...series)
  const maxValue = Math.max(...series)
  const range = maxValue - minValue || 1
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 100
      const y = 100 - ((value - minValue) / range) * 100
      return `${x},${y}`
    })
    .join(" ")
  const onOpenTab = (tabKey) => {
    if (typeof onNavigate === "function") onNavigate(tabKey)
  }

  const kpiItems = [
    canViewSales && {
      id: "sales",
      label: "Son 7 gun satis",
      value: summary.last7Total,
      hint: `Ortalama ${summary.average}`,
      tone: "from-emerald-500/20 to-emerald-500/5",
    },
    canViewTasks && {
      id: "tasks",
      label: "Aktif gorev",
      value: activeTaskCount,
      hint: `${tasks.todo} bekleyen`,
      tone: "from-sky-500/20 to-sky-500/5",
    },
    canViewProblems && {
      id: "problems",
      label: "Problemli musteri",
      value: openCount,
      hint: openCount > 0 ? "Takipte" : "Temiz",
      tone: "from-rose-500/20 to-rose-500/5",
    },
    canViewStock && {
      id: "stock",
      label: "Biten urun",
      value: stocks.empty,
      hint: `Kullanim ${stockUsage}%`,
      tone: "from-amber-500/20 to-amber-500/5",
    },
    canViewMessages && {
      id: "templates",
      label: "Sablon",
      value: templateCountText,
      hint: `Kategori ${categoryCountText}`,
      tone: "from-indigo-500/20 to-indigo-500/5",
    },
    canViewLists && {
      id: "lists",
      label: "Listeler",
      value: listCountText,
      hint: "Aktif",
      tone: "from-slate-500/20 to-slate-500/5",
    },
  ].filter(Boolean)
  const fallbackKpis = [
    {
      id: "modules",
      label: "Erisim modulu",
      value: moduleCount,
      hint: "Gorunur sekmeler",
      tone: "from-slate-500/15 to-slate-500/5",
    },
    {
      id: "permissions",
      label: "Yetki seviyesi",
      value: permissionCount,
      hint: "Rol kapsaminda",
      tone: "from-slate-500/15 to-slate-500/5",
    },
    {
      id: "resolved",
      label: "Cozulen problem",
      value: resolvedCount,
      hint: "Takip kaydi",
      tone: "from-slate-500/15 to-slate-500/5",
    },
  ]
  const kpisToShow = kpiItems.length > 0 ? kpiItems : fallbackKpis
  const actionItems = [
    canViewTasks && {
      id: "act-tasks",
      label: "Gorevleri planla",
      detail: "Yeni aksiyon ekle",
      tab: "tasks",
      tone: "from-sky-500/25 to-sky-500/5",
    },
    canViewSales && {
      id: "act-sales",
      label: "Satis girisi",
      detail: "Yeni kayit ekle",
      tab: "sales",
      tone: "from-emerald-500/25 to-emerald-500/5",
    },
    canViewProblems && {
      id: "act-problems",
      label: "Problemli musteriler",
      detail: "Kayitlari guncelle",
      tab: "problems",
      tone: "from-rose-500/25 to-rose-500/5",
    },
    canViewStock && {
      id: "act-stock",
      label: "Stok guncelle",
      detail: "Urunleri kontrol et",
      tab: "stock",
      tone: "from-amber-500/25 to-amber-500/5",
    },
    canViewMessages && {
      id: "act-messages",
      label: "Sablonlari yonet",
      detail: "Mesaj havuzu",
      tab: "messages",
      tone: "from-indigo-500/25 to-indigo-500/5",
    },
    canViewLists && {
      id: "act-lists",
      label: "Listeleri ac",
      detail: "Katilimlari guncelle",
      tab: "lists",
      tone: "from-slate-500/25 to-slate-500/5",
    },
  ].filter(Boolean)
  const tableRows = [
    canViewTasks && {
      id: "row-tasks",
      label: "Gorev toplam",
      value: tasks.total,
      status: tasks.total > 0 ? "Planli" : "Bos",
    },
    canViewSales && {
      id: "row-sales",
      label: "Satis kaydi",
      value: summary.count,
      status: summary.count > 0 ? "Aktif" : "Bos",
    },
    canViewStock && {
      id: "row-stock",
      label: "Stok urun",
      value: stocks.total,
      status: stocks.empty > 0 ? "Takip" : "Stabil",
    },
    canViewMessages && {
      id: "row-templates",
      label: "Sablonlar",
      value: templateCountText,
      status: "Hazir",
    },
    canViewLists && {
      id: "row-lists",
      label: "Listeler",
      value: listCountText,
      status: "Aktif",
    },
    canViewProblems && {
      id: "row-resolved",
      label: "Cozulen problem",
      value: resolvedCount,
      status: resolvedCount > 0 ? "Iyi" : "Yeni",
    },
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 p-6 shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_120%_at_0%_0%,rgba(34,197,94,0.18),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        <div className="pointer-events-none absolute -right-28 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
              Is Yonetim Paneli
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-white">Akis</h1>
            <p className="mt-2 text-sm text-slate-200/80">
              Merhaba {userName}, bugunku operasyonlari tek bakista yonetebilirsin.
            </p>
          </div>
          <div className="flex flex-wrap items-stretch gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/90 to-emerald-200/40 text-lg font-semibold text-ink-900">
                {userInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-slate-400">{userRole}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Yetki: {permissionCount}
                </p>
              </div>
            </div>
            <div className="min-w-[200px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Sistem</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Durum stabil
              </div>
              <div className="mt-2 text-xs text-slate-400">Erisim modulu: {moduleCount}</div>
              <div className="mt-1 text-xs text-slate-400">Cozulen problem: {resolvedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpisToShow.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item.tone} px-4 py-4 shadow-inner`}
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-200/70">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
            <p className="text-xs text-slate-200/70">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-900/55`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Operasyon grafigi</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                Genel ivme
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-ink-900/70 p-4 shadow-inner">
              <svg viewBox="0 0 100 100" className="h-40 w-full">
                <defs>
                  <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(52,211,153,0.35)" />
                    <stop offset="100%" stopColor="rgba(52,211,153,0)" />
                  </linearGradient>
                </defs>
                <polyline
                  points={points}
                  fill="none"
                  stroke="url(#trendLine)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={`${points} 100,100 0,100`}
                  fill="url(#trendFill)"
                  stroke="none"
                />
              </svg>
              <div className="mt-3 grid grid-cols-7 gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                {["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                  <div key={day} className="text-center">
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${panelClass} bg-ink-900/55`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Durum tablosu</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-3 bg-ink-900/80 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-slate-400">
                <div>Konu</div>
                <div>Deger</div>
                <div>Durum</div>
              </div>
              <div className="divide-y divide-white/5">
                {tableRows.map((row, index) => (
                  <div
                    key={row.id}
                    className={`grid grid-cols-3 px-4 py-3 text-sm ${
                      index % 2 === 0 ? "bg-ink-900/60" : "bg-ink-900/40"
                    }`}
                  >
                    <div className="text-slate-200">{row.label}</div>
                    <div className="text-white">{row.value}</div>
                    <div className="text-slate-300">{row.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-900/55`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Aksiyonlar</p>
            <div className="mt-4 space-y-3">
              {actionItems.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onOpenTab(action.tab)}
                  className={`w-full rounded-2xl border border-white/10 bg-gradient-to-br ${action.tone} px-4 py-3 text-left shadow-inner transition hover:-translate-y-0.5 hover:border-white/20`}
                >
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-xs text-slate-300">{action.detail}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-200/80">
                    Ac
                    <span className="h-1 w-6 rounded-full bg-white/20" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`${panelClass} bg-ink-900/55`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Kisa notlar</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Erisim</p>
                <p className="text-lg font-semibold text-white">{moduleCount} modul</p>
                <p className="text-xs text-slate-400">Yetki seviyesi {permissionCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Risk ozet</p>
                <p className="text-lg font-semibold text-white">
                  {openCount + stocks.empty + tasks.todo}
                </p>
                <p className="text-xs text-slate-400">Toplam acik nokta</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Stok</p>
                <p className="text-lg font-semibold text-white">{stockUsage}%</p>
                <p className="text-xs text-slate-400">Kullanim orani</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
