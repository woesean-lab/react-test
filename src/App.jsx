import { useMemo, useState } from 'react'
import './App.css'

const messageTemplates = [
  { label: 'Hoş geldin', value: 'Hoş geldin! Burada herkese yer var.' },
  { label: 'Bilgilendirme', value: 'Son durum: Görev planlandığı gibi ilerliyor.' },
  { label: 'Hatırlatma', value: 'Unutma: Akşam 6:00 toplantısına hazır ol.' },
]

function App() {
  const [title, setTitle] = useState('Ugur Yorulmaz')
  const [message, setMessage] = useState('Hoş geldin! Burada herkese yer var.')
  const [templates, setTemplates] = useState(messageTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState(messageTemplates[0].label)
  const [items, setItems] = useState([])

  const activeTemplate = useMemo(
    () => templates.find((tpl) => tpl.label === selectedTemplate),
    [selectedTemplate, templates],
  )

  const handleTemplateChange = (event) => {
    const nextTemplate = event.target.value
    setSelectedTemplate(nextTemplate)
    const tpl = templates.find((item) => item.label === nextTemplate)
    if (tpl) setMessage(tpl.value)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      alert('Mesaj kopyalandı')
    } catch (error) {
      console.error('Copy failed', error)
      alert('Kopyalama başarısız oldu')
    }
  }

  const handleAdd = () => {
    if (!title.trim() && !message.trim()) return
    const safeTitle = title.trim() || `Mesaj ${templates.length + 1}`
    const safeMessage = message.trim()

    setItems((prev) => [...prev, { title: safeTitle, message: safeMessage }])

    const exists = templates.some((tpl) => tpl.label === safeTitle)
    if (!exists) {
      const nextTemplates = [...templates, { label: safeTitle, value: safeMessage }]
      setTemplates(nextTemplates)
    }
    setSelectedTemplate(safeTitle)
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{title || 'Ugur Yorulmaz'}</h1>
        <p className="page__subtitle">Mesaj oluştur, seç ve kopyala.</p>
      </header>

      <section className="panel">
        <div className="field">
          <label htmlFor="title">Başlık</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık gir"
          />
        </div>

        <div className="field">
          <label htmlFor="template">Şablon</label>
          <div className="field__inline">
            <select id="template" value={selectedTemplate} onChange={handleTemplateChange}>
              {templates.map((tpl) => (
                <option key={tpl.label} value={tpl.label}>
                  {tpl.label}
                </option>
              ))}
            </select>
            <button type="button" className="ghost" onClick={handleCopy}>
              Kopyala
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="message">Mesaj</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Mesaj içeriği"
          />
        </div>

        <div className="field field--actions">
          <button type="button" onClick={handleAdd}>
            Ekle
          </button>
          {activeTemplate && (
            <span className="note">
              Seçili: <strong>{activeTemplate.label}</strong>
            </span>
          )}
        </div>
      </section>

      <section className="messages">
        {items.length === 0 && <p className="empty">Henüz eklenmiş mesaj yok.</p>}
        {items.map((item, index) => (
          <article key={`${item.title}-${index}`} className="message-card">
            <div className="message-card__title">{item.title || 'Başlıksız'}</div>
            <p className="message-card__body">{item.message || 'Mesaj yok'}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default App
