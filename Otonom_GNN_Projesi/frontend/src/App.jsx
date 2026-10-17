import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const typeNames = { 0: 'Dron', 1: 'Hedef', 2: 'Sivil', 3: 'Engel' }
const typeColors = { 0: '#5de1ff', 1: '#ff6464', 2: '#a6e86d', 3: '#aab7bd' }
const initialObjects = [
  { type: 0, x: 18, y: 24, speed: 12, threat: 0.1 },
  { type: 1, x: 74, y: 70, speed: 0, threat: 0.2 },
]

function App() {
  const [objects, setObjects] = useState(initialObjects)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateObject(index, field, value) {
    setObjects((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: Number(value) } : item
    )))
    setResult(null)
  }

  function addObject() {
    setObjects((current) => [...current, { type: 3, x: 50, y: 50, speed: 0, threat: 0.5 }])
  }

  function removeObject(index) {
    if (index < 2) return
    setObjects((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setResult(null)
  }

  async function predict() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objects }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Tahmin alınamadı.')
      setResult(payload)
    } catch (requestError) {
      console.error('Taktiksel analiz isteği başarısız:', requestError)
      setError(`${requestError.message} Backend adresini ve VITE_API_URL ayarını kontrol edin.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-6 font-display text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex items-center gap-4 border-b border-line pb-6">
          <div className="grid h-11 w-11 place-items-center border border-cyan font-mono text-sm text-cyan">DG</div>
          <div><p className="font-mono text-[10px] tracking-[0.18em] text-slate-500">AUTONOMOUS SYSTEMS / LIVE INFERENCE</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Otonom Sistem Yer Kontrol Radarı</h1></div>
          <div className="ml-auto hidden items-center gap-2 font-mono text-[10px] text-lime sm:flex"><span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_0_5px_rgba(166,232,109,.12)]" /> MODEL READY</div>
        </header>

        <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(380px,.8fr)_minmax(500px,1.2fr)]">
          <aside className="order-2 border border-line bg-panel p-5 lg:order-1">
            <div className="mb-5 flex items-start justify-between"><div><span className="font-mono text-[10px] tracking-[0.16em] text-slate-500">01 / KONTROL VE VERİ GİRİŞİ</span><h2 className="mt-1 text-xl font-medium">Sahne nesneleri</h2></div><span className="font-mono text-xs text-cyan">{objects.length} NODE</span></div>
            <div className="grid gap-2">
              {objects.map((item, index) => (
                <div className="grid grid-cols-[24px_1fr_54px_54px_54px_54px_22px] items-end gap-1.5 border border-line bg-ink/70 p-2" key={index}>
                  <span className="self-center font-mono text-xs" style={{ color: typeColors[item.type] }}>{String(index).padStart(2, '0')}</span>
                  <label className="min-w-0"><span className="block font-mono text-[9px] text-slate-500">TÜR</span><select className="mt-1 w-full border border-slate-700 bg-slate-900 px-1.5 py-2 text-xs text-slate-200 outline-none focus:border-cyan" value={item.type} onChange={(event) => updateObject(index, 'type', event.target.value)} disabled={index < 2}>{Object.entries(typeNames).map(([type, name]) => <option value={type} key={type}>{name}</option>)}</select></label>
                  {['x', 'y', 'speed', 'threat'].map((field) => <label className="font-mono text-[9px] text-slate-500" key={field}>{field === 'speed' ? 'HIZ' : field === 'threat' ? 'TEHDİT' : field.toUpperCase()}<input className="mt-1 w-full border border-slate-700 bg-slate-900 px-1.5 py-2 text-xs text-slate-200 outline-none focus:border-cyan" type="number" min="0" max={field === 'speed' ? '20' : field === 'threat' ? '1' : '100'} step={field === 'threat' ? '0.05' : '1'} value={item[field]} onChange={(event) => updateObject(index, field, event.target.value)} /></label>)}
                  {index > 1 ? <button className="h-8 text-lg text-alert hover:text-red-300" onClick={() => removeObject(index)} aria-label="Nesneyi sil">×</button> : <span />}
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_1.5fr]"><button className="border border-slate-700 px-3 py-3 text-xs text-slate-300 transition hover:border-cyan hover:text-cyan" onClick={addObject}>+ Yeni nesne ekle</button><button className="bg-cyan px-3 py-3 text-xs font-semibold text-ink transition hover:bg-white disabled:cursor-wait disabled:opacity-60" onClick={predict} disabled={loading}>{loading ? 'ANALİZ EDİLİYOR...' : 'TAKTİKSEL ANALİZ YAP →'}</button></div>
            {error && <p className="mt-4 border-l-2 border-alert bg-alert/10 p-3 text-xs leading-5 text-red-200">{error}</p>}
            <div className="mt-8 border-t border-line pt-5"><span className="font-mono text-[10px] tracking-[0.16em] text-slate-500">MODEL GİRDİSİ</span><p className="mt-2 text-xs leading-5 text-slate-400">Her düğüm: Tür · X · Y · Hız · Tehdit. Koordinatlar 0–100, hız 0–20, tehdit 0–1 aralığındadır.</p></div>
          </aside>

          <section className="order-1 border border-line bg-panel p-5 lg:order-2"><div className="mb-5 flex items-start justify-between"><div><span className="font-mono text-[10px] tracking-[0.16em] text-slate-500">02 / GÖRSEL RADAR</span><h2 className="mt-1 text-xl font-medium">Operasyon alanı</h2></div><span className="font-mono text-xs text-slate-500">X: 0–100 · Y: 0–100</span></div>
            {result && <div className={`mb-4 flex items-center gap-4 border px-5 py-3 ${result.class_id === 2 ? 'border-alert bg-alert/10 text-alert' : result.class_id === 1 ? 'border-amber bg-amber/10 text-amber' : 'border-lime bg-lime/10 text-lime'}`}><span className="font-mono text-sm opacity-70">0{result.class_id}</span><strong className="text-2xl tracking-[0.08em]">{result.label.toUpperCase()}</strong><span className="ml-auto hidden font-mono text-[10px] opacity-70 sm:block">{result.probabilities.map((value) => `${(value * 100).toFixed(1)}%`).join(' · ')}</span></div>}
            <div className="mx-auto aspect-square w-full max-w-[500px] border border-line bg-[#0d1b21] p-3 shadow-cyan"><svg className="h-full w-full" viewBox="0 0 500 500" role="img" aria-label="Sahne nesneleri radarı"><defs><pattern id="radar-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#29414a" strokeWidth="1" /></pattern></defs><rect width="500" height="500" fill="url(#radar-grid)" /><circle cx="250" cy="250" r="165" fill="none" stroke="#31515b" strokeDasharray="3 8" /><circle cx="250" cy="250" r="82" fill="none" stroke="#31515b" strokeDasharray="3 8" /><path d="M250 0V500M0 250H500" stroke="#31515b" strokeDasharray="2 7" /><text x="10" y="20" fill="#6e8992" fontSize="10" fontFamily="DM Mono">Y 100</text><text x="450" y="490" fill="#6e8992" fontSize="10" fontFamily="DM Mono">X 100</text>{objects.map((item, index) => { const cx = item.x * 5; const cy = 500 - item.y * 5; return <g key={index} transform={`translate(${cx} ${cy})`}><circle r={item.type === 0 ? 11 : 8} fill="#0d1b21" stroke={typeColors[item.type]} strokeWidth="2" /><circle r="3" fill={typeColors[item.type]} /><text x="14" y="4" fill="#b8c8cc" fontSize="10" fontFamily="DM Mono">{String(index).padStart(2, '0')} {typeNames[item.type]}</text></g> })}</svg></div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] text-slate-400">{Object.entries(typeNames).map(([type, name]) => <span className="flex items-center gap-2" key={type}><i className="h-2 w-2 rounded-full" style={{ background: typeColors[type] }} />{name}</span>)}</div>
          </section>
        </section>
        <footer className="mt-5 flex justify-between border-t border-line pt-4 font-mono text-[10px] text-slate-600"><span>GNN CONTROL / V1.0</span><span>PYTORCH GEOMETRIC · FASTAPI</span></footer>
      </div>
    </main>
  )
}

export default App
