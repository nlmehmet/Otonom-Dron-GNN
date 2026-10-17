import { useState } from 'react'

function App() {
  // Sahnede varsayılan olarak duran nesneler
  const [nodes, setNodes] = useState([
    { id: 1, type: 'Dron', x: 20, y: 80, color: 'blue' },
    { id: 2, type: 'Hedef', x: 80, y: 20, color: 'red' },
    { id: 3, type: 'Engel', x: 50, y: 50, color: 'gray' }
  ])
  
  const [analizSonucu, setAnalizSonucu] = useState("Bekleniyor...")

  // Butona basıldığında Colab'deki yapay zekaya istek atan fonksiyon
  const taktikselAnalizYap = async () => {
    setAnalizSonucu("Yapay Zeka Hesaplanıyor...")
    try {
      // Kelimeleri yapay zekanın anlayacağı sayılara (0,1,2) çeviriyoruz
      const tipCevirici = { 'Dron': 0, 'Hedef': 1, 'Engel': 2, 'Sivil': 3 };
      const apiIcinDuzenlenmisVeri = nodes.map(n => ({
        ...n,
        type: tipCevirici[n.type] || 0
      }));

      const response = await fetch("https://metal-moose-switch.loca.lt/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true" 
        },
        body: JSON.stringify({ objects: apiIcinDuzenlenmisVeri })
      })
      
      const data = await response.json()
      setAnalizSonucu(data.karar || data.prediction || JSON.stringify(data))
    } catch (error) {
      console.error(error)
      setAnalizSonucu("Bağlantı Hatası! Colab linkini kontrol edin.")
    }
  }
  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#1e1e1e', color: 'white', minHeight: '100vh' }}>
      
      {/* SOL PANEL: Kontroller */}
      <div style={{ flex: 1, backgroundColor: '#2d2d2d', padding: '1.5rem', borderRadius: '10px' }}>
        <h2>Taktiksel Otonom Dron Radarı</h2>
        <p>Sahnede {nodes.length} nesne bulunuyor.</p>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {nodes.map(node => (
            <li key={node.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#3d3d3d', borderRadius: '5px' }}>
              <strong>{node.type}</strong> - Koordinat: (X: {node.x}, Y: {node.y})
            </li>
          ))}
        </ul>

        <button 
          onClick={taktikselAnalizYap}
          style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Taktiksel Analiz Yap
        </button>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#111', borderRadius: '5px', border: '1px solid #4CAF50' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>Yapay Zeka Kararı:</h3>
          <p style={{ fontSize: '20px', margin: 0 }}>{analizSonucu}</p>
        </div>
      </div>

      {/* SAĞ PANEL: Radar Ekranı (SVG) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '500px', height: '500px', backgroundColor: '#000', border: '2px solid #4CAF50', borderRadius: '5px', backgroundImage: 'radial-gradient(#4CAF50 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
          
          {nodes.map(node => (
            <div key={node.id} style={{
              position: 'absolute',
              left: `${node.x}%`,
              bottom: `${node.y}%`, // Y eksenini aşağıdan yukarı başlatmak için
              width: '20px',
              height: '20px',
              backgroundColor: node.color,
              borderRadius: '50%',
              transform: 'translate(-50%, 50%)',
              boxShadow: `0 0 10px ${node.color}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {node.type.charAt(0)}
            </div>
          ))}
          
        </div>
      </div>

    </div>
  )
}

export default App