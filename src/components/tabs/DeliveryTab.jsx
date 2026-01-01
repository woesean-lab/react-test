import { useEffect, useMemo, useState } from "react"
import { DELIVERY_MAPS_STORAGE_KEY } from "../../constants/appConstants"

const createMapId = () => `map-${Date.now()}-${Math.random().toString(16).slice(2)}`

const buildSteps = (raw) =>
  String(raw || "")
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean)

const normalizeStoredMaps = (raw) => {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      const title = String(item?.title ?? "").trim()
      const steps = Array.isArray(item?.steps)
        ? item.steps.map((step) => String(step ?? "").trim()).filter(Boolean)
        : []
      const createdAt = typeof item?.createdAt === "string" ? item.createdAt : new Date().toISOString()
      const updatedAt = typeof item?.updatedAt === "string" ? item.updatedAt : createdAt
      return {
        id: String(item?.id ?? createMapId()),
        title,
        steps,
        createdAt,
        updatedAt,
      }
    })
    .filter((map) => map.title || map.steps.length > 0)
}

const formatMapDate = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

const getInitialMaps = () => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(DELIVERY_MAPS_STORAGE_KEY)
    if (!stored) return []
    return normalizeStoredMaps(JSON.parse(stored))
  } catch (error) {
    console.warn("Could not read delivery maps", error)
    return []
  }
}

export default function DeliveryTab({ panelClass }) {
  const [maps, setMaps] = useState(() => getInitialMaps())
  const [activeId, setActiveId] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [listSearch, setListSearch] = useState("")
  const [listSort, setListSort] = useState("recent")
  const [createDraft, setCreateDraft] = useState({ title: "", steps: "" })
  const [editDraft, setEditDraft] = useState({ title: "", steps: "" })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(DELIVERY_MAPS_STORAGE_KEY, JSON.stringify(maps))
    } catch (error) {
      console.warn("Could not persist delivery maps", error)
    }
  }, [maps])

  useEffect(() => {
    if (activeId && maps.some((item) => item.id === activeId)) return
    setActiveId(maps[0]?.id ?? "")
  }, [activeId, maps])

  const activeMap = useMemo(() => maps.find((item) => item.id === activeId) || null, [activeId, maps])
  const filteredMaps = useMemo(() => {
    const query = listSearch.trim().toLowerCase()
    const source = query
      ? maps.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(query)
          if (titleMatch) return true
          return item.steps.some((step) => step.toLowerCase().includes(query))
        })
      : maps
    const getTimestamp = (item) => {
      const value = item.updatedAt || item.createdAt
      const time = Date.parse(value)
      return Number.isNaN(time) ? 0 : time
    }
    const sorted = [...source].sort((a, b) => {
      if (listSort === "title") {
        return a.title.localeCompare(b.title)
      }
      if (listSort === "oldest") {
        return getTimestamp(a) - getTimestamp(b)
      }
      return getTimestamp(b) - getTimestamp(a)
    })
    return sorted
  }, [listSearch, listSort, maps])

  useEffect(() => {
    if (!activeMap || isEditing) return
    setEditDraft({
      title: activeMap.title,
      steps: activeMap.steps.join("\n"),
    })
  }, [activeMap, isEditing])

  const activeStepsCount = activeMap?.steps.length ?? 0
  const activeUpdatedAt = activeMap
    ? formatMapDate(activeMap.updatedAt || activeMap.createdAt)
    : ""
  const activeCreatedAt = activeMap ? formatMapDate(activeMap.createdAt) : ""

  const handleCreate = () => {
    const title = createDraft.title.trim()
    if (!title) return
    const steps = buildSteps(createDraft.steps)
    const now = new Date().toISOString()
    const nextMap = {
      id: createMapId(),
      title,
      steps,
      createdAt: now,
      updatedAt: now,
    }
    setMaps((prev) => [nextMap, ...prev])
    setActiveId(nextMap.id)
    setIsEditing(false)
    setEditDraft({ title: nextMap.title, steps: nextMap.steps.join("\n") })
    setCreateDraft({ title: "", steps: "" })
  }

  const handleEditStart = () => {
    if (!activeMap) return
    setIsEditing(true)
    setEditDraft({
      title: activeMap.title,
      steps: activeMap.steps.join("\n"),
    })
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    if (!activeMap) return
    setEditDraft({
      title: activeMap.title,
      steps: activeMap.steps.join("\n"),
    })
  }

  const handleEditSave = () => {
    if (!activeMap) return
    const title = editDraft.title.trim()
    if (!title) return
    const steps = buildSteps(editDraft.steps)
    const now = new Date().toISOString()
    setMaps((prev) =>
      prev.map((item) =>
        item.id === activeMap.id ? { ...item, title, steps, updatedAt: now } : item,
      ),
    )
    setIsEditing(false)
  }

  const canCreate = Boolean(createDraft.title.trim())
  const canSave = Boolean(editDraft.title.trim())
  const createStepsPreview = useMemo(() => buildSteps(createDraft.steps), [createDraft.steps])
  const createStepsCount = createStepsPreview.length
  const createStepsSample = createStepsPreview.slice(0, 3)
  const createStepsExtra = Math.max(0, createStepsCount - createStepsSample.length)

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ink-900/85 p-6 shadow-card">
        <div
          className="absolute inset-0 bg-[radial-gradient(850px_circle_at_12%_10%,_rgba(58,199,255,0.18),_transparent_55%)]"
          aria-hidden="true"
        />
        <div
          className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-accent-400/60 via-white/10 to-transparent"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-accent-200">
                Teslimat
              </span>
              <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
                Operasyon panosu
              </span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Teslimat Studio
            </h1>
            <p className="max-w-2xl text-sm text-slate-200/80">
              Haritalari olustur, adimlari standarda bagla, ekiple ayni dili kullan.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              {activeMap ? (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase tracking-[0.2em] text-slate-300">
                  Secili: <span className="ml-1 font-semibold text-slate-100">{activeMap.title}</span>
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase tracking-[0.2em] text-slate-300">
                  Secili harita yok
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase tracking-[0.2em] text-slate-300">
                {maps.length} harita
              </span>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-2xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-4">
              <span
                className="absolute right-0 top-0 h-10 w-10 bg-accent-500/20 blur-2xl"
                aria-hidden="true"
              />
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Toplam harita</p>
              <p className="mt-3 text-2xl font-semibold text-white">{maps.length}</p>
              <p className="mt-1 text-[11px] text-slate-400">Teslimat akislari</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-4">
              <span
                className="absolute right-0 top-0 h-10 w-10 bg-accent-500/10 blur-2xl"
                aria-hidden="true"
              />
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Aktif adim</p>
              <p className="mt-3 text-2xl font-semibold text-white">{activeStepsCount}</p>
              <p className="mt-1 text-[11px] text-slate-400">Secili harita adimi</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-4">
              <span
                className="absolute right-0 top-0 h-10 w-10 bg-white/10 blur-2xl"
                aria-hidden="true"
              />
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
                Son guncelleme
              </p>
              <p className="mt-3 text-lg font-semibold text-white">{activeUpdatedAt || "-"}</p>
              <p className="mt-1 text-[11px] text-slate-400">Secili harita tarihi</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] xl:items-start">
        <div className={`${panelClass} relative overflow-hidden bg-ink-900/60`}>
          <div
            className="absolute -right-16 top-8 h-32 w-32 rounded-full bg-accent-500/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Harita dizini
                </p>
                <p className="text-xs text-slate-400">Kayitli teslimat akislari</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  {filteredMaps.length} / {maps.length}
                </span>
                {listSearch && (
                  <span className="inline-flex items-center rounded-full border border-accent-200/40 bg-accent-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-100">
                    Filtre
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
              <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Ara
                <div className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-ink-900 px-3">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                  <input
                    type="text"
                    value={listSearch}
                    onChange={(event) => setListSearch(event.target.value)}
                    placeholder="Baslik veya adim"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Sirala
                <select
                  value={listSort}
                  onChange={(event) => setListSort(event.target.value)}
                  className="h-11 rounded-lg border border-white/10 bg-ink-900 px-3 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="recent">Son guncellenen</option>
                  <option value="title">Basliga gore</option>
                  <option value="oldest">En eski</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {filteredMaps.length} / {maps.length} kayit
              </span>
              <span className="uppercase tracking-[0.2em] text-slate-600">
                {listSort === "recent"
                  ? "Son guncellenen"
                  : listSort === "title"
                    ? "Basliga gore"
                    : "En eski"}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70">
              {maps.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  Henuz urun haritasi yok.
                </div>
              ) : filteredMaps.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  Eslesme bulunamadi.
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto sm:max-h-[520px] divide-y divide-white/10">
                  {filteredMaps.map((item) => {
                    const isActive = item.id === activeId
                    const displayDate = formatMapDate(item.updatedAt || item.createdAt) || "-"
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveId(item.id)
                          setIsEditing(false)
                        }}
                        className={`group relative flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm transition ${
                          isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <span
                          className={`absolute left-0 top-0 h-full w-0.5 ${
                            isActive ? "bg-accent-400" : "bg-transparent"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isActive ? "bg-accent-200" : "bg-slate-600"
                              }`}
                            />
                            <span className="min-w-0 truncate font-semibold">{item.title}</span>
                          </div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                            {item.steps.length} adim
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-slate-500">
                          <span>{displayDate}</span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${
                              isActive
                                ? "border-accent-200/50 bg-accent-500/15 text-accent-100"
                                : "border-white/10 bg-white/5 text-slate-400"
                            }`}
                          >
                            {isActive ? "Secili" : "Harita"}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${panelClass} relative overflow-hidden bg-ink-900/60`}>
          <div
            className="absolute -left-16 top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Akis detayi
                </p>
                <h2 className="text-lg font-semibold text-white">
                  {activeMap ? activeMap.title : "Secili urun yok"}
                </h2>
                {activeMap && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase tracking-[0.2em] text-slate-300">
                      {activeStepsCount} adim
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase tracking-[0.2em] text-slate-300">
                      Olusturma {activeCreatedAt || "-"}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase tracking-[0.2em] text-slate-300">
                      Guncelleme {activeUpdatedAt || "-"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isEditing && (
                  <span className="inline-flex items-center rounded-full border border-amber-300/50 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-100">
                    Duzenleme
                  </span>
                )}
                {activeMap && !isEditing && (
                  <button
                    type="button"
                    onClick={handleEditStart}
                    className="rounded-lg border border-accent-200/60 bg-accent-500/10 px-3 py-2 text-xs font-semibold text-accent-50 transition hover:border-accent-200 hover:bg-accent-500/20"
                  >
                    Duzenle
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              {!activeMap ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-xs text-slate-400">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-ink-900/70">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
                      <path d="M9 3v15" />
                      <path d="M15 6v15" />
                    </svg>
                  </div>
                  <p>Listeden bir urun sec veya yeni harita olustur.</p>
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-900/70 p-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-200" htmlFor="edit-title">
                        Urun basligi
                      </label>
                      <input
                        id="edit-title"
                        type="text"
                        value={editDraft.title}
                        onChange={(event) =>
                          setEditDraft((prev) => ({ ...prev, title: event.target.value }))
                        }
                        className="w-full rounded-lg border border-white/15 bg-ink-900/70 px-3 py-2 text-sm text-slate-100 focus:border-accent-200 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-200" htmlFor="edit-steps">
                        Teslimat adimlari
                      </label>
                      <textarea
                        id="edit-steps"
                        rows={8}
                        value={editDraft.steps}
                        onChange={(event) =>
                          setEditDraft((prev) => ({ ...prev, steps: event.target.value }))
                        }
                        placeholder="Her satir yeni adim"
                        className="w-full resize-none rounded-lg border border-white/15 bg-ink-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-200 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleEditSave}
                      disabled={!canSave}
                      className="min-w-[140px] rounded-lg border border-accent-200/70 bg-accent-500/15 px-4 py-2 text-xs font-semibold text-accent-50 transition hover:border-accent-200 hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="min-w-[140px] rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:text-slate-100"
                    >
                      Vazgec
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeMap.steps.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-xs text-slate-400">
                      Bu harita icin adim yok.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeMap.steps.map((step, index) => (
                        <div
                          key={`${activeMap.id}-step-${index}`}
                          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-ink-900/80 text-[11px] font-semibold text-accent-100">
                            {index + 1}
                          </span>
                          <p className="text-sm leading-relaxed text-slate-200">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={`${panelClass} relative overflow-hidden bg-ink-900/70`}>
        <div
          className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(520px_circle_at_80%_20%,_rgba(58,199,255,0.12),_transparent_65%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                Yeni harita
              </p>
              <p className="text-xs text-slate-400">Urun teslimat akisi tasarla</p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Lokal</span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-900/70 p-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200" htmlFor="create-title">
                    Urun basligi
                  </label>
                  <input
                    id="create-title"
                    type="text"
                    value={createDraft.title}
                    onChange={(event) =>
                      setCreateDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Orn: Pro surum teslimat"
                    className="w-full rounded-lg border border-white/15 bg-ink-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-200 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200" htmlFor="create-steps">
                    Teslimat adimlari
                  </label>
                  <textarea
                    id="create-steps"
                    rows={7}
                    value={createDraft.steps}
                    onChange={(event) =>
                      setCreateDraft((prev) => ({ ...prev, steps: event.target.value }))
                    }
                    placeholder="Her satir yeni adim"
                    className="w-full resize-none rounded-lg border border-white/15 bg-ink-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-200 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!canCreate}
                className="w-full rounded-lg border border-accent-200/70 bg-accent-500/15 px-4 py-2 text-xs font-semibold text-accent-50 transition hover:border-accent-200 hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Harita ekle
              </button>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-900/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Taslak ozeti
                </p>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {createStepsCount} adim
                </span>
              </div>
              {createStepsSample.length > 0 ? (
                <div className="space-y-2">
                  {createStepsSample.map((step, index) => (
                    <div key={`preview-step-${index}`} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-2 w-2 rounded-full bg-accent-200" />
                      <span className="leading-relaxed text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Adimlar burada gorunur.</p>
              )}
              {createStepsExtra > 0 && (
                <p className="text-[11px] text-slate-500">+{createStepsExtra} adim daha</p>
              )}
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[11px] text-slate-400">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Standart
                </p>
                <p className="mt-2">
                  Baslik net olsun, her satir tek adim, kritik notlari ustte tut.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}




