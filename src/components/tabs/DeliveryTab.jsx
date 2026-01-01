import { useCallback, useEffect, useMemo, useState } from "react"
import { DELIVERY_MAPS_STORAGE_KEY } from "../../constants/appConstants"
import LoadingIndicator from "../LoadingIndicator"
import DeliveryNoteModal from "../modals/DeliveryNoteModal"

const emptyDraft = { title: "", body: "", tags: "" }

const normalizeNote = (note) => ({
  title: note?.title ?? "",
  body: note?.body ?? "",
  tags: note?.tags ?? "",
})

const hasNoteContent = (note) =>
  Boolean(note.title.trim() || note.body.trim() || note.tags.trim())

const previewText = (text, limit = 240) => {
  if (!text) return ""
  return text.length > limit ? `${text.slice(0, limit)}...` : text
}

export default function DeliveryTab({
  isLoading,
  panelClass,
  products = [],
  templates = [],
  handleProductCopyMessage,
}) {
  const [search, setSearch] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState({})
  const [activeProductId, setActiveProductId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(DELIVERY_MAPS_STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === "object") {
        setDeliveryNotes(parsed)
      }
    } catch (error) {
      console.warn("Could not read delivery notes", error)
    }
  }, [])

  const persistNotes = useCallback((next) => {
    setDeliveryNotes(next)
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(DELIVERY_MAPS_STORAGE_KEY, JSON.stringify(next))
    } catch (error) {
      console.warn("Could not save delivery notes", error)
    }
  }, [])

  const getDeliveryMessage = useCallback(
    (product) => {
      const templateLabel = product?.deliveryTemplate?.trim()
      if (templateLabel) {
        const templateMessage = templates
          ?.find((tpl) => tpl.label === templateLabel)
          ?.value?.trim()
        if (templateMessage) return templateMessage
      }
      return product?.deliveryMessage?.trim() || ""
    },
    [templates],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return products
    return products.filter((product) => {
      const note = normalizeNote(deliveryNotes[product.id])
      const deliveryMessage = getDeliveryMessage(product)
      const haystack = [
        product?.name,
        product?.deliveryTemplate,
        deliveryMessage,
        note.title,
        note.body,
        note.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [search, products, deliveryNotes, getDeliveryMessage])

  const stats = useMemo(() => {
    const total = products.length
    let withMessage = 0
    let withNotes = 0
    let missing = 0

    products.forEach((product) => {
      const deliveryMessage = getDeliveryMessage(product)
      const note = normalizeNote(deliveryNotes[product.id])
      const hasMessage = Boolean(deliveryMessage)
      const hasNote = hasNoteContent(note)
      if (hasMessage) withMessage += 1
      if (hasNote) withNotes += 1
      if (!hasMessage && !hasNote) missing += 1
    })

    return { total, withMessage, withNotes, missing }
  }, [products, deliveryNotes, getDeliveryMessage])

  const openNoteModal = (product) => {
    if (!product) return
    const existing = normalizeNote(deliveryNotes[product.id])
    setActiveProductId(product.id)
    setDraft(hasNoteContent(existing) ? existing : { ...emptyDraft, title: product?.name || "" })
    setDeleteConfirm(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setDeleteConfirm(false)
    setActiveProductId(null)
    setDraft(emptyDraft)
  }

  const handleSave = () => {
    if (!activeProductId) return
    const trimmed = {
      title: draft.title.trim(),
      body: draft.body.trim(),
      tags: draft.tags.trim(),
    }
    if (!hasNoteContent(trimmed)) return
    persistNotes({ ...deliveryNotes, [activeProductId]: trimmed })
    closeModal()
  }

  const handleDelete = () => {
    if (!activeProductId) return
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    const next = { ...deliveryNotes }
    delete next[activeProductId]
    persistNotes(next)
    closeModal()
  }

  const activeNote = activeProductId ? normalizeNote(deliveryNotes[activeProductId]) : null
  const isEditing = Boolean(activeNote && hasNoteContent(activeNote))
  const canSave = hasNoteContent(draft)

  if (isLoading) {
    return (
      <div className={`${panelClass} bg-ink-900/70`}>
        <LoadingIndicator label={"Teslimat verileri y\u00fckleniyor"} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-4 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
              Teslimat
            </span>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Teslimat
            </h1>
            <p className="max-w-2xl text-sm text-slate-200/80">
              {"\u00dcr\u00fcn bazl\u0131 teslimat notlar\u0131n\u0131 tek yerde topla, ekip hizl\u0131ca bulsun."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-accent-200">
              {"\u00dcr\u00fcn: "}
              {stats.total}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-accent-200">
              {"Mesajl\u0131: "}
              {stats.withMessage}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
              {"Notlu: "}
              {stats.withNotes}
            </span>
            {stats.missing > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-100">
                {"Eksik: "}
                {stats.missing}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <div className={`${panelClass} bg-ink-800/60`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300/80">
                  Teslimat arama
                </p>
                <p className="text-sm text-slate-400">
                  {"\u00dcr\u00fcn, mesaj veya not i\u00e7inde ara."}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <div className="flex h-11 w-full items-center gap-3 rounded border border-white/10 bg-ink-900 px-4 shadow-inner">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Ara</span>
                  <div className="flex flex-1 items-center gap-2">
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
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={"\u00dcr\u00fcn ad\u0131, mesaj, not"}
                      className="w-full min-w-0 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {filteredProducts.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                  {"E\u015fle\u015fen \u00fcr\u00fcn bulunamad\u0131."}
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const note = normalizeNote(deliveryNotes[product.id])
                  const hasNote = hasNoteContent(note)
                  const deliveryMessage = getDeliveryMessage(product)
                  const deliveryTemplate = product?.deliveryTemplate?.trim()
                  const canCopy =
                    Boolean(deliveryMessage) && typeof handleProductCopyMessage === "function"

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-white/10 bg-ink-900/70 p-4 shadow-inner"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold text-white">{product.name}</span>
                            {deliveryTemplate && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                                {deliveryTemplate}
                              </span>
                            )}
                            {hasNote && (
                              <span className="rounded-full border border-emerald-300/60 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-50">
                                {"Not var"}
                              </span>
                            )}
                          </div>

                          {deliveryMessage ? (
                            <p className="text-sm text-slate-200/80 whitespace-pre-wrap">
                              {deliveryMessage}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400">
                              {"Teslimat mesaj\u0131 yok. Stok sekmesinden \u015fablon se\u00e7."}
                            </p>
                          )}

                          {hasNote && (
                            <div className="rounded-xl border border-white/10 bg-ink-900/60 p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  {"Yerel not"}
                                </span>
                                {note.tags.trim() && (
                                  <span className="text-[11px] text-slate-500">{note.tags}</span>
                                )}
                              </div>
                              {note.title.trim() && (
                                <p className="mt-1 text-sm font-semibold text-slate-100">
                                  {note.title}
                                </p>
                              )}
                              {note.body.trim() && (
                                <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">
                                  {previewText(note.body.trim())}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {canCopy && (
                            <button
                              type="button"
                              onClick={() => handleProductCopyMessage(product.id)}
                              className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-500/15 hover:text-indigo-50"
                            >
                              {"Mesaj\u0131 kopyala"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openNoteModal(product)}
                            className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-accent-300 hover:bg-accent-500/15 hover:text-accent-50"
                          >
                            {hasNote ? "Notu duzenle" : "Not ekle"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <div className={`${panelClass} relative overflow-hidden bg-ink-900/70`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_20%_0%,rgba(58,199,255,0.12),transparent)]" />
            <div className="relative space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/80">
                {"Teslimat Nas\u0131l Yap\u0131l\u0131r?"}
              </p>
              <ol className="space-y-2 text-sm text-slate-200/80">
                <li>{"1) \u00dcr\u00fcn\u00fc ara ve teslimat mesaj\u0131n\u0131 kontrol et."}</li>
                <li>{"2) \u00dcr\u00fcn\u00fcn \u00f6zel ad\u0131mlar\u0131n\u0131 Yerel Not olarak ekle."}</li>
                <li>{"3) Teslimat \u00e7\u0131kt\u0131s\u0131nda mesaj\u0131 kopyala ve uygula."}</li>
              </ol>
            </div>
          </div>

          <div className={`${panelClass} bg-ink-900/70`}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/80">
              {"Notlar nerede saklan\u0131r?"}
            </p>
            <p className="mt-3 text-sm text-slate-200/80">
              {"Bu sekme veri taban\u0131 kullanmaz. Teslimat notlar\u0131 taray\u0131c\u0131n\u0131n haf\u0131zas\u0131nda saklan\u0131r."}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              {"Ayn\u0131 hesab\u0131 farkl\u0131 cihazlarda kullan\u0131yorsan, notlar\u0131 yeniden girmen gerekebilir."}
            </p>
          </div>
        </div>
      </div>

      <DeliveryNoteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        draft={draft}
        setDraft={setDraft}
        canSave={canSave}
        isEditing={isEditing}
        onDelete={isEditing ? handleDelete : undefined}
        deleteConfirm={deleteConfirm}
      />
    </div>
  )
}
