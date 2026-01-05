import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "react-hot-toast"

const tokenBaseClass =
  "inline-flex items-center gap-2 rounded-[999px] border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200/80 transition hover:border-accent-300/60 hover:text-white"
const tokenNodeClass = tokenBaseClass
const tokenButtonClass = tokenBaseClass
const actionButtonClass =
  "inline-flex items-center justify-center rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
const selectTriggerClass =
  "flex w-full flex-col items-start gap-1 rounded-[16px] border border-white/10 bg-ink-900/60 px-4 py-3 text-left transition hover:border-white/20 hover:bg-ink-900/80 disabled:cursor-not-allowed disabled:opacity-50"

const createTokenNode = ({ type, label, value, productId }) => {
  const node = document.createElement("span")
  node.dataset.token = type
  if (label) node.dataset.label = label
  if (value) node.dataset.value = value
  if (productId) node.dataset.productId = productId
  node.setAttribute("contenteditable", "false")
  node.setAttribute("draggable", "true")
  node.className = tokenNodeClass
  node.style.cursor = "move"
  node.textContent = label || "Islev"
  return node
}

export default function DeliveryMapModal({
  isOpen,
  onClose,
  productName,
  templates,
  products,
  splitStocks,
  draft,
  setDraft,
  onSave,
  isSaving = false,
}) {
  if (!isOpen) return null

  const safeTemplates = Array.isArray(templates) ? templates : []
  const safeProducts = Array.isArray(products) ? products : []

  const editorRef = useRef(null)
  const lineRef = useRef(null)
  const hydratedRef = useRef(false)
  const draggingTokenRef = useRef(null)
  const [editorEmpty, setEditorEmpty] = useState(true)
  const [lineCount, setLineCount] = useState(1)
  const [charCount, setCharCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showStockPicker, setShowStockPicker] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")

  const stockOptions = useMemo(
    () =>
      safeProducts
        .map((product) => ({
          id: String(product?.id ?? ""),
          name: String(product?.name ?? "").trim(),
        }))
        .filter((item) => item.id && item.name),
    [safeProducts],
  )
  const selectedStockLabel =
    stockOptions.find((option) => option.id === selectedProductId)?.name || "Urun sec"

  const getAvailableStockCodes = (productId) => {
    const target = safeProducts.find((item) => item.id === productId)
    if (!target) return []
    const list = Array.isArray(target.stocks) ? target.stocks : []
    const available = splitStocks ? splitStocks(list).available : list.filter((stk) => stk?.status !== "used")
    return available.map((stk) => String(stk?.code ?? "").trim()).filter(Boolean)
  }

  const updateEditorEmpty = () => {
    const editor = editorRef.current
    if (!editor) return
    const html = editor.innerHTML || ""
    const normalizedHtml = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>\s*<div>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n")
    const container = document.createElement("div")
    container.innerHTML = normalizedHtml
    const rawText = container.textContent || ""
    const normalizedText = rawText.replace(/\r\n/g, "\n")
    const hasTokens = Boolean(editor.querySelector("[data-token]"))
    const trimmed = normalizedText.trim()
    setEditorEmpty(!hasTokens && !trimmed)
    const lines = normalizedText ? normalizedText.split("\n").length : 1
    setLineCount(Math.max(1, lines))
    setCharCount(normalizedText.length)
  }

  const hydrateEditor = () => {
    const editor = editorRef.current
    if (!editor) return
    editor.innerHTML = draft.note || ""
    updateEditorEmpty()
  }

  useEffect(() => {
    if (!isOpen) {
      hydratedRef.current = false
      setIsEditing(false)
      return
    }
    if (!hydratedRef.current) {
      hydrateEditor()
      hydratedRef.current = true
      if (!draft.note?.trim()) {
        setIsEditing(true)
      }
    }
  }, [draft.note, isOpen])

  useEffect(() => {
    if (!isEditing) {
      setShowTemplatePicker(false)
      setShowStockPicker(false)
    }
  }, [isEditing])

  const handleEditorInput = () => {
    if (!isEditing) return
    const editor = editorRef.current
    if (!editor) return
    setDraft((prev) => ({ ...prev, note: editor.innerHTML }))
    updateEditorEmpty()
  }

  const handleEditorClick = (event) => {
    const token = event.target?.closest?.("[data-token]")
    if (!token) return
    const type = token.dataset.token
    if (type === "message") {
      const value = token.dataset.value || ""
      if (!value) return
      navigator.clipboard
        .writeText(value)
        .then(() => toast.success("Mesaj kopyalandi."))
        .catch(() => toast.error("Kopyalanamadi."))
      return
    }
    if (type === "stock") {
      const productId = token.dataset.productId || ""
      if (!productId) return
      const codes = getAvailableStockCodes(productId)
      if (codes.length === 0) {
        toast.error("Kullanilabilir stok yok.")
        return
      }
      navigator.clipboard
        .writeText(codes.join("\n"))
        .then(() => toast.success(`${codes.length} stok kopyalandi.`))
        .catch(() => toast.error("Kopyalanamadi."))
    }
  }

  const handleEnableEditing = () => {
    setIsEditing(true)
    requestAnimationFrame(() => editorRef.current?.focus())
  }

  const insertTokenAtCursor = (node) => {
    if (!isEditing) {
      toast.error("Once duzenlemeyi ac.")
      return
    }
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      editor.appendChild(node)
      editor.appendChild(document.createTextNode(" "))
      handleEditorInput()
      return
    }
    const range = selection.getRangeAt(0)
    if (!editor.contains(range.startContainer)) {
      editor.appendChild(node)
      editor.appendChild(document.createTextNode(" "))
      handleEditorInput()
      return
    }
    range.deleteContents()
    range.insertNode(node)
    const spacer = document.createTextNode(" ")
    node.after(spacer)
    range.setStartAfter(spacer)
    range.setEndAfter(spacer)
    selection.removeAllRanges()
    selection.addRange(range)
    handleEditorInput()
  }

  const handleTemplateInsert = (template) => {
    if (!isEditing) {
      toast.error("Once duzenlemeyi ac.")
      return
    }
    if (!template?.value) return
    setDraft((prev) => ({ ...prev, template: template.label }))
    const token = createTokenNode({
      type: "message",
      label: template.label,
      value: template.value,
    })
    insertTokenAtCursor(token)
    setShowTemplatePicker(false)
  }

  const handleStockInsert = () => {
    if (!isEditing) {
      toast.error("Once duzenlemeyi ac.")
      return
    }
    const target = safeProducts.find((item) => item.id === selectedProductId)
    if (!target) {
      toast.error("Stok urunu secmelisin.")
      return
    }
    const token = createTokenNode({
      type: "stock",
      label: `Stok: ${target.name || "Urun"}`,
      productId: target.id,
    })
    insertTokenAtCursor(token)
    setSelectedProductId("")
    setShowStockPicker(false)
  }

  const handleEditorDragStart = (event) => {
    if (!isEditing) return
    const token = event.target?.closest?.("[data-token]")
    if (!token) return
    draggingTokenRef.current = token
    const payload = JSON.stringify({
      token: token.dataset.token,
      label: token.dataset.label,
      value: token.dataset.value,
      productId: token.dataset.productId,
    })
    event.dataTransfer?.setData("text/plain", payload)
  }

  const handleEditorDrop = (event) => {
    if (!isEditing) return
    event.preventDefault()
    const payload = event.dataTransfer?.getData("text/plain")
    if (!payload) return
    try {
      const parsed = JSON.parse(payload)
      if (!parsed?.token) return
      if (draggingTokenRef.current) {
        draggingTokenRef.current.remove()
        draggingTokenRef.current = null
      }
      const token = createTokenNode({
        type: parsed.token,
        label: parsed.label,
        value: parsed.value,
        productId: parsed.productId,
      })
      insertTokenAtCursor(token)
    } catch (error) {
      // ignore
    }
  }

  const handleEditorDragEnd = () => {
    draggingTokenRef.current = null
  }

  const handleEditorScroll = () => {
    if (!lineRef.current || !editorRef.current) return
    lineRef.current.scrollTop = editorRef.current.scrollTop
  }

  const modal = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-[24px] border border-white/10 bg-ink-900 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -top-40 right-[-160px] h-80 w-80 rounded-[999px] bg-accent-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-44 left-[-160px] h-80 w-80 rounded-[999px] bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 px-6 py-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-[999px] border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-[999px] bg-accent-400" />
                Teslimat sablonu
              </div>
              <p className="font-display text-3xl font-semibold text-white">{productName || "Urun"}</p>
              <p className="max-w-md text-xs text-slate-500">
                Mesaj, stok ve notu tek bir kompozisyonda yonet.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-[16px] border border-white/10 bg-ink-900/70 px-3 py-2 text-center">
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">Karakter</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{charCount}</p>
              </div>
              <div className="rounded-[16px] border border-white/10 bg-ink-900/70 px-3 py-2 text-center">
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">Satir</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{lineCount}</p>
              </div>
              <span
                className={`rounded-[999px] border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] ${
                  isEditing
                    ? "border-accent-300/60 bg-accent-500/10 text-accent-50"
                    : "border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {isEditing ? "Duzenleme acik" : "Salt okuma"}
              </span>
              <button
                type="button"
                onClick={handleEnableEditing}
                disabled={isEditing}
                className={`${actionButtonClass} border-accent-300/60 bg-accent-500/10 text-accent-50 hover:border-accent-200 hover:bg-accent-500/20`}
              >
                Duzenle
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-white/30 hover:text-white"
              >
                Kapat
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="rounded-[18px] border border-white/10 bg-ink-900/70 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Mesaj sablonu
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Hazir sablonu sec, nota token olarak ekle.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplatePicker((prev) => !prev)
                      setShowStockPicker(false)
                    }}
                    disabled={!isEditing}
                    aria-expanded={showTemplatePicker}
                    className={`${selectTriggerClass} mt-3 ${
                      showTemplatePicker ? "border-accent-300/60 bg-ink-900/90" : ""
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Sablon sec
                    </span>
                    <span className="flex w-full items-center justify-between gap-3 text-xs font-semibold text-slate-100">
                      <span className="truncate">{draft.template || "Sec"}</span>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-3 w-3 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {showTemplatePicker && (
                    <div className="mt-3 rounded-[14px] border border-white/10 bg-ink-900/90 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Sablonlar
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowTemplatePicker(false)}
                          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-200"
                        >
                          Kapat
                        </button>
                      </div>
                      <div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-auto">
                        {safeTemplates.length > 0 ? (
                          safeTemplates.map((tpl) => (
                            <button
                              key={tpl.id ?? tpl.label}
                              type="button"
                              onClick={() => handleTemplateInsert(tpl)}
                              className={tokenButtonClass}
                            >
                              {tpl.label}
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">Sablon bulunamadi.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[18px] border border-white/10 bg-ink-900/70 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Stok ekle
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Stok tokeni tiklaninca kodlari kopyalar.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStockPicker((prev) => !prev)
                      setShowTemplatePicker(false)
                    }}
                    disabled={!isEditing}
                    aria-expanded={showStockPicker}
                    className={`${selectTriggerClass} mt-3 ${
                      showStockPicker ? "border-accent-300/60 bg-ink-900/90" : ""
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Urun sec
                    </span>
                    <span className="flex w-full items-center justify-between gap-3 text-xs font-semibold text-slate-100">
                      <span className="truncate">{selectedStockLabel}</span>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-3 w-3 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {showStockPicker && (
                    <div className="mt-3 rounded-[14px] border border-white/10 bg-ink-900/90 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Stok secimi
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowStockPicker(false)}
                          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-200"
                        >
                          Kapat
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <select
                          value={selectedProductId}
                          onChange={(event) => setSelectedProductId(event.target.value)}
                          className="min-w-[200px] flex-1 rounded-[12px] border border-white/10 bg-ink-900 px-3 py-2 text-xs text-slate-100 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-500/30"
                        >
                          <option value="">Urun sec</option>
                          {stockOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                        <button type="button" onClick={handleStockInsert} className={actionButtonClass}>
                          Ekle
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[18px] border border-white/10 bg-ink-900/60 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Ipuclari
                  </p>
                  <div className="mt-2 space-y-2 text-xs text-slate-500">
                    <p>Tokenleri tiklayarak mesaj veya stok kodlarini kopyala.</p>
                    <p>Tokenleri surukleyip birakabilir, sirayi degistirebilirsin.</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-ink-900/70 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-ink-900/80 px-4 py-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Teslimat notu
                    </p>
                    <p className="text-xs text-slate-500">Notu serbest duzenle, tokenleri ekle.</p>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {charCount} karakter | {lineCount} satir
                  </span>
                </div>
                <div className="flex max-h-[420px] overflow-hidden">
                  <div
                    ref={lineRef}
                    className="w-12 shrink-0 overflow-hidden border-r border-white/10 bg-ink-900/80 px-2 py-3 text-right font-mono text-[11px] leading-6 text-slate-500/80"
                  >
                    {Array.from({ length: lineCount }, (_, index) => (
                      <div key={index}>{index + 1}</div>
                    ))}
                  </div>
                  <div className="relative flex-1">
                    {editorEmpty && (
                      <div className="pointer-events-none absolute left-4 top-3 text-sm text-slate-500">
                        Teslimat notunu yaz veya sablon ekle.
                      </div>
                    )}
                    <div
                      ref={editorRef}
                      role="textbox"
                      contentEditable={isEditing}
                      aria-readonly={!isEditing}
                      onInput={handleEditorInput}
                      onClick={handleEditorClick}
                      onScroll={handleEditorScroll}
                      onDragStart={handleEditorDragStart}
                      onDragEnd={handleEditorDragEnd}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleEditorDrop}
                      className={`h-full min-h-[360px] overflow-auto bg-ink-900/60 px-4 py-3 font-mono text-[13px] leading-6 outline-none transition ${
                        isEditing ? "text-slate-100" : "text-slate-300"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-ink-900/80 px-6 py-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Esc ile kapat</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-w-[120px] rounded-[14px] border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-white/30 hover:text-white"
              >
                Iptal
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="min-w-[150px] rounded-[14px] border border-accent-300/70 bg-accent-500/15 px-5 py-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-accent-50 shadow-glow transition hover:-translate-y-0.5 hover:border-accent-200 hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
