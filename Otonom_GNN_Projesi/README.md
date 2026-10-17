# Otonom GNN Dron Yer Kontrol Istasyonu

## Klasor yapisi

```text
Otonom_GNN_Projesi/
├── tactical_gnn.pth
├── backend/
│   ├── 
│   └── requirements.txt
└── frontend/
    ├── package.json
  ├── tailwind.config.js
  ├── postcss.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

## Kurulum komutlari

PowerShell:

```powershell
cd C:\Users\L\Desktop\vscode\Otonom_GNN_Projesi

# Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

# Frontend (sifirdan olusturmak icin alternatif komut)
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

Mevcut iskelet zaten `frontend/` altinda oldugu icin yeniden `npm create vite` calistirmak yerine `cd frontend; npm install` yeterlidir.

Frontend Tailwind CSS v3, PostCSS ve Autoprefixer ile yapilandirilmistir. `npm install` sonrasinda Vite bu ayarlari otomatik kullanir.

Backend'de `http://localhost:5173` icin CORS aciktir. Frontend baska bir portta calisacaksa `backend/` icindeki `allow_origins` listesine o adresi ekleyin.

## Calistirma

Iki terminal acin.

Terminal 1:

```powershell
cd C:\Users\L\Desktop\vscode\Otonom_GNN_Projesi
.\.venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload --port 8000
```

Terminal 2:

```powershell
cd C:\Users\L\Desktop\vscode\Otonom_GNN_Projesi\frontend
npm run dev
```

Arayuz: http://localhost:5173
API dokumani: http://localhost:8000/docs

## Ornek API istegi

```json
{
  "objects": [
    {"type": 0, "x": 18, "y": 24},
    {"type": 1, "x": 74, "y": 70},
    {"type": 3, "x": 42, "y": 52}
  ]
}
```

`type` degerleri: `0` Dron, `1` Ana Hedef, `2` Sivil, `3` Engel.
Her nesne ayrica `speed` (0-20) ve `threat` (0-1) alanlarini tasir.

## Google Colab backend

Notebookun sonundaki Colab hücresi `fastapi`, `uvicorn`, `nest_asyncio`, `pyngrok` ve `torch-geometric` paketlerini kurar; `tactical_gnn.pth` dosyasını yükler ve `CORS('*')` ile ngrok üzerinden public URL üretir.

1. Hücrede `NGROK_AUTH_TOKEN` değerini [ngrok Dashboard](https://dashboard.ngrok.com/get-started/your-authtoken) üzerindeki token ile değiştirin.
2. Hücreyi Colab'de çalıştırın ve yazdırılan `Public URL` değerini kopyalayın.
3. `frontend/.env.local` dosyasını oluşturup public adresi yazın:

```env
VITE_API_URL=https://ornek-ngrok-adresi.ngrok-free.app
```

4. Vite sunucusunu yeniden başlatın. React artık `/predict` isteklerini Colab backendine gönderir.

Ngrok tokenını kaynak koda veya herkese açık bir depoya commit etmeyin. Colab oturumu kapanınca public URL de kapanır.
