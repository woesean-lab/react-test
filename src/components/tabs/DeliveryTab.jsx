import { useMemo } from "react"

const tagToneClasses = {
  emerald: "border-emerald-300/50 bg-emerald-500/10 text-emerald-50",
  sky: "border-sky-300/50 bg-sky-500/10 text-sky-50",
  amber: "border-amber-300/50 bg-amber-500/10 text-amber-50",
  fuchsia: "border-fuchsia-300/50 bg-fuchsia-500/10 text-fuchsia-50",
  rose: "border-rose-300/50 bg-rose-500/10 text-rose-50",
  indigo: "border-indigo-300/50 bg-indigo-500/10 text-indigo-50",
}
const tagTones = Object.keys(tagToneClasses)
const parseDraftTags = (value) =>
  String(value ?? "")
    .split(/[,#]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Yeni"
  return date.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })
}

function TagPill({ tag, onClick, toneIndex = 0, count = null }) {
  const tone = tagTones[toneIndex % tagTones.length]
  return (
    <button
      type="button"
      onClick={() => onClick?.(tag)}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition hover:scale-[1.02] ${tagToneClasses[tone]}`}
    >
      <span className="text-xs text-white/80">#</span>
      <span className="text-white/90">{tag}</span>
      {count ? <span className="text-[10px] text-slate-200/80">({count})</span> : null}
    </button>
  )
}

export default function DeliveryTab({
  panelClass,
  deliveryNotes,
  allNotesCount,
  deliveryDraft,
  setDeliveryDraft,
  deliverySearchInput,
  setDeliverySearchInput,
  deliverySearchQuery,
  handleDeliverySearch,
  handleDeliveryClearSearch,
  handleDeliveryTagSelect,
  handleDeliveryNoteAdd,
  handleDeliveryNoteDelete,
  deliveryTagCloud,
  deliveryStats,
}) {
  const draftTags = useMemo(() => parseDraftTags(deliveryDraft.tags), [deliveryDraft.tags])

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
              Teslimat
            </span>
            <h1 className="font-display text-3xl font-semibold text-white">Teslimat Notlar\u0131</h1>
            <p className="max-w-2xl text-sm text-slate-200/80">
              Evernote tarz\u0131 hafif bir panel: teslimat s\u00fcreciyle ilgili notlar\u0131 ekle, etiketle ve an\u0131nda ara.
              Bu b\u00f6l\u00fcm tamamen lokal \u00e7al\u0131\u015f\u0131r; veri taban\u0131na gerek yok.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-right sm:grid-cols-3 sm:text-left">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Toplam</p>
              <p className="text-2xl font-semibold text-white">{deliveryStats.total}</p>
              <p className="text-xs text-slate-400">Not kayd\u0131</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Filtre</p>
              <p className="text-2xl font-semibold text-white">{deliveryStats.filtered}</p>
              <p className="text-xs text-slate-400">G\u00f6r\u00fcnen not</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Etiket</p>
              <p className="text-2xl font-semibold text-white">{deliveryStats.tags}</p>
              <p className="text-xs text-slate-400">Aktif tag</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className={`${panelClass} bg-ink-900/70`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300/80">
                Yeni not
              </p>
              <p className="text-sm text-slate-400">Teslimat ak\u0131\u015f\u0131 i\u00e7in yeni bir sayfa ekle.</p>
            </div>
            <span className="rounded-full border border-accent-400/50 bg-accent-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-50 shadow-glow">
              Lokal
            </span>
          </div>

          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              handleDeliveryNoteAdd()
            }}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200" htmlFor="delivery-title">
                Not ba\u015fl\u0131\u011f\u0131
              </label>
              <input
                id="delivery-title"
                type="text"
                value={deliveryDraft.title}
                onChange={(event) =>
                  setDeliveryDraft((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Kurye, adres, VIP g\u00f6nderi..."
                className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200" htmlFor="delivery-tags">
                Etiketler
              </label>
              <input
                id="delivery-tags"
                type="text"
                value={deliveryDraft.tags}
                onChange={(event) =>
                  setDeliveryDraft((prev) => ({ ...prev, tags: event.target.value }))
                }
                placeholder="virg\u00fcl ile ay\u0131r: oncelik, kurye, depo"
                className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
              />
              {draftTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {draftTags.map((tag, idx) => (
                    <TagPill key={`draft-tag-${tag}-${idx}`} tag={tag} toneIndex={idx} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200" htmlFor="delivery-body">
                Not i\u00e7eri\u011fi
              </label>
              <textarea
                id="delivery-body"
                value={deliveryDraft.body}
                onChange={(event) =>
                  setDeliveryDraft((prev) => ({ ...prev, body: event.target.value }))
                }
                rows={8}
                placeholder="Teslimat ak\u0131\u015f\u0131, \u00e7al\u0131\u015fan notu, k\u0131sa aksiyon listesi..."
                className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Kaydettikten sonra arama ve tag se\u00e7imiyle an\u0131nda filtreleyebilirsin.
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-accent-400/60 bg-accent-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-accent-50 shadow-glow transition hover:-translate-y-0.5 hover:border-accent-300 hover:bg-accent-500/25"
              >
                Notu ekle
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14m-7-7h14" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className={`${panelClass} bg-ink-900/70`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300/80">
                  Arama
                </p>
                <p className="text-sm text-slate-400">
                  Ba\u015Fl\u0131k veya etiket bazl\u0131 arama yap, tam e\u015Fle\u015Fme gerekmez.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                  {deliveryStats.filtered} / {allNotesCount} sonu\u00e7
                </span>
                {deliverySearchQuery && (
                  <span className="rounded-full border border-accent-300/50 bg-accent-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-50 shadow-glow">
                    Aktif: {deliverySearchQuery}
                  </span>
                )}
              </div>
            </div>

            <form
              className="mt-4 flex flex-col gap-3 md:flex-row"
              onSubmit={(event) => {
                event.preventDefault()
                handleDeliverySearch()
              }}
            >
              <input
                type="text"
                value={deliverySearchInput}
                onChange={(event) => setDeliverySearchInput(event.target.value)}
                placeholder="Not ba\u015Fl\u0131\u011F\u0131 veya #tag ara"
                className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
              />
              <div className="flex gap-2 md:w-auto">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent-400/60 bg-accent-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-accent-50 shadow-glow transition hover:-translate-y-0.5 hover:border-accent-300 hover:bg-accent-500/25"
                >
                  Ara
                </button>
                {deliverySearchQuery && (
                  <button
                    type="button"
                    onClick={handleDeliveryClearSearch}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </form>

            {deliveryTagCloud.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Pop\u00fcler etiketler
                </p>
                <div className="flex flex-wrap gap-2">
                  {deliveryTagCloud.map(({ tag, count }, idx) => (
                    <TagPill
                      key={`tag-cloud-${tag}`}
                      tag={tag}
                      toneIndex={idx}
                      count={count}
                      onClick={handleDeliveryTagSelect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-slate-300 shadow-inner">
            <p>
              Arama, ba\u015Fl\u0131k ve etikette k\u0131smi e\u015Fle\u015Fme yapar. Filtre temizleme ile t\u00fcm
              kay\u0131tlar geri gelir. Silme i\u015Flemi yaln\u0131zca lokal durumdan kayd\u0131 kald\u0131r\u0131r.
            </p>
          </div>
        </div>
      </div>

      <div className={`${panelClass} bg-ink-900/60`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300/80">
              Not listesi
            </p>
            <p className="text-sm text-slate-400">
              {deliveryNotes.length === 0
                ? "Kay\u0131t bulunamad\u0131."
                : "Son eklenen notlar en \u00fcstte, aramaya g\u00f6re filtrelenir."}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
            {deliveryNotes.length} not
          </span>
        </div>

        {deliveryNotes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-slate-300">
            Hen\u00fcz hi\u00e7 not yok. Soldan yeni bir teslimat notu ekleyebilirsin.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {deliveryNotes.map((note, idx) => (
              <article
                key={note.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950/60 p-4 shadow-card transition hover:-translate-y-1 hover:border-white/20"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${note.color} opacity-70`}
                  aria-hidden
                />
                <div className="relative space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-300/70">
                        {formatDate(note.createdAt)}
                      </p>
                      <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeliveryNoteDelete(note.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-100 opacity-0 transition hover:border-rose-300/60 hover:bg-rose-500/10 hover:text-rose-50 group-hover:opacity-100"
                      title="Notu sil"
                      aria-label="Notu sil"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 9-6 6m6 0-6-6" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100/90">
                    {note.body || "A\u00e7\u0131klama yok."}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, tagIdx) => (
                        <TagPill
                          key={`${note.id}-tag-${tag}-${tagIdx}`}
                          tag={tag}
                          toneIndex={tagIdx + idx}
                          onClick={handleDeliveryTagSelect}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
