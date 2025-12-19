import { useEffect, useMemo, useState } from "react"
import toast, { Toaster } from "react-hot-toast"

const categoryPalette = [
  "from-cyan-500/70 to-sky-400/70",
  "from-amber-500/70 to-orange-400/70",
  "from-emerald-500/70 to-lime-400/70",
  "from-rose-500/70 to-pink-400/70",
  "from-indigo-500/70 to-blue-400/70",
  "from-teal-500/70 to-cyan-300/70",
]

const initialProblems = [
  { id: 1, username: "musteri_akarsu", issue: "Sipariş iki kez oluşturulmuş, ücret iadesi bekliyor.", status: "open" },
  { id: 2, username: "elifkar", issue: "Kargo adresi yanlış, teslimat durdurulmalı.", status: "open" },
]

function formatColor(index) {
  const gradient = categoryPalette[index % categoryPalette.length]
  return `bg-gradient-to-r ${gradient}`
}

function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner shadow-black/20 backdrop-blur">
      <SkeletonLine className="mb-3 h-4 w-32" />
      <SkeletonLine className="mb-2 h-3 w-full" />
      <SkeletonLine className="mb-2 h-3 w-5/6" />
      <div className="mt-4 flex gap-2">
        <SkeletonLine className="h-8 w-24" />
        <SkeletonLine className="h-8 w-24" />
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState("messages")

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Genel")
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [openCategories, setOpenCategories] = useState([])
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [confirmCategoryTarget, setConfirmCategoryTarget] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const [delayDone, setDelayDone] = useState(false)

  const [problems, setProblems] = useState([])
  const [problemUsername, setProblemUsername] = useState("")
  const [problemIssue, setProblemIssue] = useState("")
  const [confirmProblemTarget, setConfirmProblemTarget] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDelayDone(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    loadTemplates()
    loadProblems()
  }, [])

  async function loadTemplates() {
    setIsLoading(true)
    try {
      const [catRes, tplRes] = await Promise.all([fetch("/api/categories"), fetch("/api/templates")])
      const fetchedCategories = (await catRes.json()) ?? []
      const fetchedTemplates = (await tplRes.json()) ?? []

      setCategories(fetchedCategories)
      setTemplates(fetchedTemplates)

      if (!selectedCategory && fetchedCategories.length > 0) {
        setSelectedCategory(fetchedCategories[0])
      }
      if (fetchedCategories.length > 0) {
        setOpenCategories((prev) => (prev.length ? prev : [fetchedCategories[0]]))
      }
      setSelectedTemplate((prev) => prev ?? fetchedTemplates[0] ?? null)
    } catch (error) {
      console.error("Templates load failed", error)
      toast.error("Şablonlar yüklenemedi")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadProblems() {
    try {
      const res = await fetch("/api/problems")
      if (!res.ok) throw new Error("fail")
      const data = await res.json()
      setProblems(data)
    } catch (error) {
      console.error("Problems load failed", error)
      setProblems(initialProblems)
      toast.error("Problemli müşteriler yüklenemedi, örnekler gösteriliyor")
    }
  }

  const showLoading = isLoading || !delayDone

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => tpl.category === selectedCategory)
  }, [templates, selectedCategory])

  const templateCountByCategory = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat] = templates.filter((t) => t.category === cat).length
      return acc
    }, {})
  }, [categories, templates])

  async function handleSaveTemplate(e) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedMessage = message.trim()
    if (!trimmedTitle || !trimmedMessage) {
      toast.error("Başlık ve mesaj zorunlu")
      return
    }
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmedTitle, value: trimmedMessage, category: selectedCategory || "Genel" }),
      })
      if (!res.ok) throw new Error("create failed")
      const created = await res.json()
      setTemplates((prev) => [...prev, created])
      setTitle("")
      setMessage("")
      setSelectedTemplate(created)
      toast.success("Şablon kaydedildi")
    } catch (error) {
      console.error("Template create error", error)
      toast.error("Şablon eklenemedi")
    }
  }

  async function handleDeleteTemplate(id) {
    if (confirmTarget !== id) {
      setConfirmTarget(id)
      toast("Silmek için tekrar tıkla")
      return
    }
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 404) throw new Error("delete failed")
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== id))
      setConfirmTarget(null)
      if (selectedTemplate?.id === id) setSelectedTemplate(null)
      toast.success("Şablon silindi")
    } catch (error) {
      console.error("Template delete error", error)
      toast.error("Şablon silinemedi")
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    const name = newCategory.trim()
    if (!name) return
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error("category add failed")
      const created = await res.json()
      setCategories((prev) => [...prev, created.name].sort())
      setNewCategory("")
      toast.success("Kategori eklendi")
    } catch (error) {
      console.error("Category add error", error)
      toast.error("Kategori eklenemedi")
    }
  }

  async function handleDeleteCategory(name) {
    if (name === "Genel") {
      toast.error("Genel silinemez")
      return
    }
    if (confirmCategoryTarget !== name) {
      setConfirmCategoryTarget(name)
      toast("Silmek için tekrar tıkla")
      return
    }
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: "DELETE" })
      if (!res.ok && res.status !== 404) throw new Error("category delete failed")
      setCategories((prev) => prev.filter((c) => c !== name))
      setTemplates((prev) => prev.map((tpl) => (tpl.category === name ? { ...tpl, category: "Genel" } : tpl)))
      setConfirmCategoryTarget(null)
      if (selectedCategory === name) setSelectedCategory("Genel")
      toast.success("Kategori silindi")
    } catch (error) {
      console.error("Category delete error", error)
      toast.error("Kategori silinemedi")
    }
  }

  async function handleCopyTemplate(tpl) {
    try {
      await navigator.clipboard.writeText(tpl.value)
      toast.success("Şablon kopyalandı")
      toast(tpl.value, { duration: 3500, icon: "📋" })
    } catch (error) {
      console.error("Copy failed", error)
      toast.error("Kopyalanamadı")
    }
  }

  async function handleAddProblem(e) {
    e.preventDefault()
    const username = problemUsername.trim()
    const issue = problemIssue.trim()
    if (!username || !issue) {
      toast.error("Kullanıcı ve sorun zorunlu")
      return
    }
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, issue }),
      })
      if (!res.ok) throw new Error("create failed")
      const created = await res.json()
      setProblems((prev) => [created, ...prev])
      setProblemUsername("")
      setProblemIssue("")
      toast.success("Eklendi")
    } catch (error) {
      console.error("Problem add error", error)
      toast.error("Eklenemedi")
    }
  }

  async function handleResolveProblem(id) {
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      })
      if (!res.ok) throw new Error("resolve failed")
      const updated = await res.json()
      setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)))
      toast.success("Çözüldü olarak işaretlendi")
    } catch (error) {
      console.error("Resolve error", error)
      toast.error("Güncellenemedi")
    }
  }

  async function handleDeleteProblem(id) {
    if (confirmProblemTarget !== id) {
      setConfirmProblemTarget(id)
      toast("Silmek için tekrar tıkla")
      return
    }
    try {
      const res = await fetch(`/api/problems/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 404) throw new Error("delete failed")
      setProblems((prev) => prev.filter((p) => p.id !== id))
      setConfirmProblemTarget(null)
      toast.success("Silindi")
    } catch (error) {
      console.error("Delete problem error", error)
      toast.error("Silinemedi")
    }
  }

  async function handleCopyUsername(username) {
    try {
      await navigator.clipboard.writeText(username)
      toast.success("Kullanıcı adı kopyalandı")
      toast(username, { duration: 3000, icon: "👤" })
    } catch (error) {
      console.error("Copy username failed", error)
      toast.error("Kopyalanamadı")
    }
  }

  const problemStats = useMemo(() => {
    const total = problems.length
    const resolved = problems.filter((p) => p.status === "resolved").length
    const open = total - resolved
    return { total, resolved, open }
  }, [problems])

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Pulcip Manage</p>
            <h1 className="text-3xl font-semibold text-white">Mesaj & Problem Yönetimi</h1>
            <p className="text-sm text-slate-400">Mesaj şablonlarını ve problemli müşterileri tek panelden yönetin.</p>
          </div>
          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {[
              { key: "messages", label: "Message Copy" },
              { key: "problems", label: "Problemli Müşteriler" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === "messages" ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">Şablon</p>
                  <h2 className="text-2xl font-semibold text-white">Yeni Mesaj</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedCategory || "Genel"}
                </span>
              </div>

              <form onSubmit={handleSaveTemplate} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Başlık</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none ring-emerald-400/30 focus:ring-2"
                    placeholder="Örn: Hoş Geldin Mesajı"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Mesaj</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none ring-emerald-400/30 focus:ring-2"
                    placeholder="Mesaj içeriğini yazın..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent px-2 py-1 text-sm text-white outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </section>

            <section className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur">
                <h3 className="mb-3 text-lg font-semibold text-white">Kategoriler</h3>
                <form onSubmit={handleAddCategory} className="flex flex-wrap items-center gap-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Yeni kategori"
                    className="flex-1 min-w-[180px] rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 focus:ring-2"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
                  >
                    Ekle
                  </button>
                </form>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {categories.map((cat, index) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-7 w-7 rounded-xl ${formatColor(index)}`} />
                        <div>
                          <p className="text-sm font-semibold text-white">{cat}</p>
                          <p className="text-xs text-slate-400">{templateCountByCategory[cat] ?? 0} şablon</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategory(cat)
                            setOpenCategories((prev) =>
                              prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
                            )
                          }}
                          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-cyan-300/60 hover:text-white"
                        >
                          Aç/Kapa
                        </button>
                        {cat !== "Genel" && (
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="rounded-lg border border-rose-400/40 px-3 py-1 text-xs text-rose-300 transition hover:border-rose-300 hover:text-rose-100"
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-indigo-300/70">Şablonlar</p>
                    <h3 className="text-lg font-semibold text-white">{selectedCategory || "Genel"}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {filteredTemplates.length} adet
                  </span>
                </div>

                {showLoading ? (
                  <div className="grid gap-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <SkeletonCard key={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openCategories.includes(selectedCategory) && filteredTemplates.length === 0 && (
                      <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                        Bu kategoride şablon yok.
                      </p>
                    )}
                    {openCategories.includes(selectedCategory) &&
                      filteredTemplates.map((tpl) => (
                        <article
                          key={tpl.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{tpl.label}</p>
                            <p className="text-xs text-slate-400">Kategori: {tpl.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyTemplate(tpl)}
                              className="rounded-xl border border-rose-400/60 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:border-rose-200 hover:bg-rose-500/10"
                            >
                              Kopyala
                            </button>
                            <button
                              onClick={() => {
                                setTitle(tpl.label)
                                setMessage(tpl.value)
                                setSelectedCategory(tpl.category)
                                setSelectedTemplate(tpl)
                              }}
                              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-cyan-300/60 hover:text-white"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-rose-300/60 hover:text-rose-100"
                            >
                              Sil
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-blue-300/70">Problemli Müşteriler</p>
                  <h2 className="text-2xl font-semibold text-white">Yeni Problem Ekle</h2>
                </div>
                <div className="ml-auto grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                  <div className="rounded-xl border border-blue-300/40 bg-blue-500/10 px-3 py-2 text-blue-100">
                    Açık
                    <div className="text-lg">{problemStats.open}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-emerald-100">
                    Çözüldü
                    <div className="text-lg">{problemStats.resolved}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-slate-200">
                    Toplam
                    <div className="text-lg">{problemStats.total}</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddProblem} className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm text-slate-300">Kullanıcı Adı</label>
                  <input
                    value={problemUsername}
                    onChange={(e) => setProblemUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
                    placeholder="örn: musteri_123"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm text-slate-300">Sorun</label>
                  <textarea
                    value={problemIssue}
                    onChange={(e) => setProblemIssue(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
                    placeholder="Sorunu yazın..."
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-blue-400"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-3">
              {problems.map((pb) => (
                <div
                  key={pb.id}
                  className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 shadow-lg shadow-black/20"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100">
                      {pb.username}
                    </span>
                    <button
                      onClick={() => handleCopyUsername(pb.username)}
                      className="rounded-lg border border-rose-400/60 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:border-rose-200 hover:bg-rose-500/10"
                    >
                      Kopyala
                    </button>
                  </div>
                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100">
                    {pb.issue}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleResolveProblem(pb.id)}
                      className="rounded-lg border border-emerald-300/60 px-3 py-2 text-[11px] font-semibold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-500/10"
                    >
                      Çözüldü
                    </button>
                    <button
                      onClick={() => handleDeleteProblem(pb.id)}
                      className="rounded-lg border border-rose-400/60 px-3 py-2 text-[11px] font-semibold text-rose-100 transition hover:border-rose-200 hover:bg-rose-500/10"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
              {problems.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                  Henüz problem eklenmedi.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Toaster
        toastOptions={{
          style: { background: "#0b1220", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.08)" },
        }}
      />
    </div>
  )
}
