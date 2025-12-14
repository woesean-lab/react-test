import { useMemo, useState } from 'react'
import './App.css'

const initialTemplates = [
  { label: 'Hos geldin', value: 'Hos geldin! Burada herkese yer var.' },
  { label: 'Bilgilendirme', value: 'Son durum: Gorev planlandigi gibi ilerliyor.' },
  { label: 'Hatirlatma', value: 'Unutma: Aksam 6:00 toplantisina hazir ol.' },
]

function App() {
  const [title, setTitle] = useState('Pulcip Message')
  const [message, setMessage] = useState(initialTemplates[0].value)
  const [templates, setTemplates] = useState(initialTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplates[0].label)

  const activeTemplate = useMemo(
    () => templates.find((tpl) => tpl.label === selectedTemplate),
    [selectedTemplate, templates],
  )

  const messageLength = message.trim().length

  const handleTemplateChange = (event) => {
    const nextTemplate = event.target.value
    setSelectedTemplate(nextTemplate)
    const tpl = templates.find((item) => item.label === nextTemplate)
    if (tpl) setMessage(tpl.value)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      alert('Mesaj kopyalandi')
    } catch (error) {
      console.error('Copy failed', error)
      alert('Kopyalama basarisiz oldu')
    }
  }

  const handleAdd = () => {
    if (!title.trim() && !message.trim()) return
    const safeTitle = title.trim() || `Mesaj ${templates.length + 1}`
    const safeMessage = message.trim()

    const exists = templates.some((tpl) => tpl.label === safeTitle)
    if (!exists) {
      const nextTemplates = [...templates, { label: safeTitle, value: safeMessage }]
      setTemplates(nextTemplates)
    }
    setSelectedTemplate(safeTitle)
  }

  const handleDeleteTemplate = () => {
    if (templates.length <= 1) {
      alert('En az bir sablon kalmali.')
      return
    }
    const nextTemplates = templates.filter((tpl) => tpl.label !== selectedTemplate)
    const fallback = nextTemplates[0]
    setTemplates(nextTemplates)
    setSelectedTemplate(fallback.label)
    setMessage(fallback.value)
  }

  return (
    <div className="page">
      <header className="page__header">
        <p className="page__eyebrow">Mesaj paneli</p>
        <h1>{title || 'Pulcip Message'}</h1>
        <p className="page__subtitle">Baslik belirle, sablon sec, metni duzenle ve kopyala.</p>
        <div className="metrics">
          <span className="metric">Sablon: {templates.length}</span>
          <span className="metric">Karakter: {messageLength}</span>
        </div>
      </header>

      <section className="cards">
        <div className="card">
          <div className="field">
            <label htmlFor="template">Sablon</label>
            <div className="field__inline">
              <select id="template" value={selectedTemplate} onChange={handleTemplateChange}>
                {templates.map((tpl) => (
                  <option key={tpl.label} value={tpl.label}>
                    {tpl.label}
                  </option>
                ))}
              </select>
              <div className="actions-inline">
                <button type="button" className="copy-btn" onClick={handleCopy}>
                  <span className="copy-btn__label">Kopyala</span>
                  <span className="copy-btn__icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="9" y="9" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M6 14V6a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <button type="button" className="ghost danger" onClick={handleDeleteTemplate}>
                  Sil
                </button>
              </div>
            </div>
          </div>
          <p className="hint">
            Secili sablon: <strong>{activeTemplate?.label || 'Yok'}</strong> • {messageLength} karakter
          </p>
        </div>

        <div className="card">
          <div className="field">
            <label htmlFor="title">Baslik</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Orn: Karsilama"
            />
          </div>

          <div className="field">
            <label htmlFor="message">Mesaj</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Mesaj icerigi"
            />
          </div>

          <div className="field field--actions">
            <button type="button" onClick={handleAdd}>
              Ekle
            </button>
            <button type="button" className="ghost" onClick={() => setMessage('')}>
              Temizle
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
