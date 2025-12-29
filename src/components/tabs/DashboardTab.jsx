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
  const taskProgress = tasks.total > 0 ? Math.round((tasks.done / tasks.total) * 100) : 0
  const taskTotal = tasks.total > 0 ? tasks.total : 1
  const stockUsage = stocks.total > 0 ? Math.round((stocks.used / stocks.total) * 100) : 0
  const riskScore =
    (canViewProblems ? openCount : 0) +
    (canViewStock ? stocks.empty : 0) +
    (canViewTasks ? tasks.todo : 0)
  const riskStatus = riskScore > 0 ? "Takipte" : "Temiz"
  const stockGaugeStyle = {
    background: `conic-gradient(#34d399 ${stockUsage * 3.6}deg, rgba(148,163,184,0.18) 0deg)`,
  }
  const canNavigate = typeof onNavigate === "function"
  const headerMetrics = [
    canViewTasks && {
      id: "tasks",
      label: "Aktif gorev",
      value: activeTaskCount,
      note: `Tamam ${tasks.done}`,
      tone: "from-sky-500/20 to-sky-500/5 text-sky-100",
    },
    (canViewProblems || canViewStock || canViewTasks) && {
      id: "risk",
      label: "Operasyon riski",
      value: riskScore,
      note: riskStatus,
      tone: "from-rose-500/20 to-rose-500/5 text-rose-100",
    },
    canViewStock && {
      id: "stock",
      label: "Stok kullanim",
      value: `${stockUsage}%`,
      note: `Biten ${stocks.empty}`,
      tone: "from-amber-500/20 to-amber-500/5 text-amber-100",
    },
  ].filter(Boolean)
  const fallbackMetrics = [
    {
      id: "modules",
      label: "Erisim modulu",
      value: moduleCount,
      note: "Gorunur sekmeler",
      tone: "from-slate-500/15 to-slate-500/5 text-slate-100",
    },
    {
      id: "permissions",
      label: "Yetki seviyesi",
      value: permissionCount,
      note: "Rol kapsaminda",
      tone: "from-slate-500/15 to-slate-500/5 text-slate-100",
    },
    {
      id: "resolved",
      label: "Cozulen problem",
      value: resolvedCount,
      note: "Takip kaydi",
      tone: "from-slate-500/15 to-slate-500/5 text-slate-100",
    },
  ]
  const metricsToShow = headerMetrics.length > 0 ? headerMetrics : fallbackMetrics
  const taskBreakdown = [
    { id: "todo", label: "Yapilacak", value: tasks.todo, color: "bg-sky-400/70" },
    { id: "doing", label: "Devam", value: tasks.doing, color: "bg-amber-400/70" },
    { id: "done", label: "Tamam", value: tasks.done, color: "bg-emerald-400/70" },
  ]
  const riskItems = [
    canViewProblems && {
      id: "risk-problems",
      title: "Problemli musteri",
      value: openCount,
      detail: openCount > 0 ? `${openCount} acik kayit` : "Sorun yok",
      tone: openCount > 0 ? "text-rose-200" : "text-emerald-200",
      dot: openCount > 0 ? "bg-rose-400" : "bg-emerald-400",
    },
    canViewStock && {
      id: "risk-stock",
      title: "Biten urun",
      value: stocks.empty,
      detail: stocks.empty > 0 ? `${stocks.empty} urun` : "Stok stabil",
      tone: stocks.empty > 0 ? "text-amber-200" : "text-emerald-200",
      dot: stocks.empty > 0 ? "bg-amber-400" : "bg-emerald-400",
    },
    canViewTasks && {
      id: "risk-tasks",
      title: "Bekleyen gorev",
      value: tasks.todo,
      detail: tasks.todo > 0 ? `${tasks.todo} yapilacak` : "Dengeli",
      tone: tasks.todo > 0 ? "text-sky-200" : "text-emerald-200",
      dot: tasks.todo > 0 ? "bg-sky-400" : "bg-emerald-400",
    },
  ].filter(Boolean)
  const quickLinks = [
    canViewTasks && {
      id: "link-tasks",
      label: "Gorevler",
      detail: "Planlama ve akis",
      tab: "tasks",
      tone: "from-sky-500/25 to-sky-500/5",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M7 7h10M7 12h10M7 17h6M4 7h.01M4 12h.01M4 17h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    canViewSales && {
      id: "link-sales",
      label: "Satis",
      detail: "Grafik ve girdi",
      tab: "sales",
      tone: "from-emerald-500/25 to-emerald-500/5",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M4 19h16M7 16l3-4 3 2 4-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    canViewProblems && {
      id: "link-problems",
      label: "Problemler",
      detail: "Musteri kayitlari",
      tab: "problems",
      tone: "from-rose-500/25 to-rose-500/5",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M12 9v5M12 17h.01M10 3h4l6 18H4L10 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    canViewStock && {
      id: "link-stock",
      label: "Stok",
      detail: "Urun kontrol",
      tab: "stock",
      tone: "from-amber-500/25 to-amber-500/5",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M3 7h18v10H3zM7 7v10M17 7v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    canViewMessages && {
      id: "link-messages",
      label: "Sablonlar",
      detail: "Mesaj havuzu",
      tab: "messages",
      tone: "from-indigo-500/25 to-indigo-500/5",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M4 6h16v9H7l-3 3V6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    canViewLists && {
      id: "link-lists",
      label: "Listeler",
      detail: "Gruplu veriler",
      tab: "lists",
      tone: "from-slate-500/25 to-slate-500/5",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ].filter(Boolean)
  const showQuickLinks = quickLinks.length > 0
  const showComms = canViewMessages || canViewLists

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 p-6 shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_120%_at_0%_0%,rgba(34,197,94,0.18),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        <div className="pointer-events-none absolute -right-28 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
                <div className="mt-1 text-xs text-slate-400">Risk skoru: {riskScore}</div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {metricsToShow.map((metric) => (
              <div
                key={metric.id}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${metric.tone} px-4 py-3 shadow-inner`}
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-200/70">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
                <p className="text-xs text-slate-200/70">{metric.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showQuickLinks && (
        <div className={`${panelClass} bg-ink-900/50`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Hizli baglantilar</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Tek tik
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  if (canNavigate) onNavigate(link.tab)
                }}
                disabled={!canNavigate}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${link.tone} p-4 text-left shadow-inner transition hover:-translate-y-0.5 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-100">
                    {link.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{link.label}</p>
                    <p className="text-xs text-slate-300">{link.detail}</p>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-200/80">
                  Ac
                  <span className="h-1 w-6 rounded-full bg-white/20 transition group-hover:w-10" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          {canViewTasks && (
            <div className={`${panelClass} bg-ink-900/55`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Gorev ritmi</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Aktif {activeTaskCount}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {taskBreakdown.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{item.label}</span>
                      <span className="text-slate-200">{item.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/5">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${Math.min(100, Math.round((item.value / taskTotal) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-dashed border-white/15 bg-ink-900/60 px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Tamamlanma</span>
                    <span className="text-slate-200">{taskProgress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-emerald-400/70"
                      style={{ width: `${taskProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {canViewSales && (
            <div className={`${panelClass} bg-ink-900/55`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Satis ozeti</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Kayit {summary.count}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-ink-900/60 px-4 py-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/80">Toplam</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{summary.total}</p>
                  <p className="text-xs text-slate-300">Son 7 gun {summary.last7Total}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Ortalama</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{summary.average}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-white/5">
                    <div className="h-1.5 rounded-full bg-emerald-400/70" style={{ width: "60%" }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Guncel ivme</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-4 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Son 7 gun</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{summary.last7Total}</p>
                  <p className="text-xs text-slate-400">Kisa vade performans</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-900/55`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Uyari panosu</p>
            <div className="mt-4 space-y-3">
              {riskItems.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-300 shadow-inner">
                  Kritik risk yok. Sistem dengeli.
                </div>
              ) : (
                riskItems.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 shadow-inner"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${alert.dot}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-100">{alert.title}</p>
                        <p className="text-xs text-slate-400">{alert.detail}</p>
                      </div>
                      <div className={`text-sm font-semibold ${alert.tone}`}>{alert.value}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {canViewStock && (
            <div className={`${panelClass} bg-ink-900/55`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Stok nabzi</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Bosalan {stocks.empty}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full" style={stockGaugeStyle}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                    {stockUsage}%
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between gap-6">
                    <span>Toplam</span>
                    <span className="text-slate-200">{stocks.total}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span>Kullanilan</span>
                    <span className="text-slate-200">{stocks.used}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span>Biten</span>
                    <span className="text-slate-200">{stocks.empty}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showComms && (
            <div className={`${panelClass} bg-ink-900/55`}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Iletisim odagi</p>
              <div className="mt-4 space-y-3">
                {canViewMessages && (
                  <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 shadow-inner">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Sablonlar</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{templateCountText}</p>
                    <p className="text-xs text-slate-400">Kategori {categoryCountText}</p>
                  </div>
                )}
                {canViewLists && (
                  <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 shadow-inner">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Listeler</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{listCountText}</p>
                    <p className="text-xs text-slate-400">Aktif listeler</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
