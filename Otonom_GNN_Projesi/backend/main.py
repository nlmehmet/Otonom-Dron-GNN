from pathlib import Path
from typing import List

import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv, global_mean_pool


PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "tactical_gnn.pth"
DEVICE = torch.device("cpu")


class TacticalDroneGNN(nn.Module):
    def __init__(self, input_dim: int = 5, hidden_dim: int = 32, num_classes: int = 3):
        super().__init__()
        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)
        self.classifier = nn.Linear(hidden_dim, num_classes)

    def forward(self, data: Data) -> torch.Tensor:
        x = torch.relu(self.conv1(data.x, data.edge_index))
        x = torch.relu(self.conv2(x, data.edge_index))
        x = global_mean_pool(x, data.batch)
        return self.classifier(x)


if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model dosyası bulunamadı: {MODEL_PATH}")

model = TacticalDroneGNN().to(DEVICE)
state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
model.load_state_dict(state_dict)
model.eval()

app = FastAPI(title="Dron Yer Kontrol Istasyonu API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SceneObject(BaseModel):
    type: int = Field(..., ge=0, le=3, description="0 Dron, 1 Ana Hedef, 2 Sivil, 3 Engel")
    x: float = Field(..., ge=0, le=100)
    y: float = Field(..., ge=0, le=100)
    speed: float = Field(0, ge=0, le=20)
    threat: float = Field(0, ge=0, le=1)


class PredictionRequest(BaseModel):
    objects: List[SceneObject] = Field(..., min_length=2)


LABELS = {
    0: "Yaklaş",
    1: "Gözlemle",
    2: "Kaçın",
}


def scene_to_data(objects: List[SceneObject]) -> Data:
    positions = torch.tensor([[item.x, item.y] for item in objects], dtype=torch.float32)
    object_types = torch.tensor([[item.type] for item in objects], dtype=torch.float32)
    speeds = torch.tensor([[item.speed] for item in objects], dtype=torch.float32)
    threat_scores = torch.tensor([[item.threat] for item in objects], dtype=torch.float32)
    x = torch.cat((object_types, positions, speeds, threat_scores), dim=1)

    distances = torch.cdist(positions, positions)
    edge_mask = (distances < 35) & ~torch.eye(len(objects), dtype=torch.bool)
    edge_index = edge_mask.nonzero(as_tuple=False).t().contiguous().to(torch.long)
    batch = torch.zeros(len(objects), dtype=torch.long)
    return Data(x=x, edge_index=edge_index, batch=batch)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_PATH.name}


@app.post("/predict")
def predict(request: PredictionRequest) -> dict:
    if request.objects[0].type != 0:
        raise HTTPException(status_code=422, detail="İlk nesne Dron (type=0) olmalıdır.")
    if request.objects[1].type != 1:
        raise HTTPException(status_code=422, detail="İkinci nesne Ana Hedef (type=1) olmalıdır.")

    data = scene_to_data(request.objects).to(DEVICE)
    with torch.inference_mode():
        logits = model(data)
        probabilities = torch.softmax(logits, dim=1)[0]
        prediction = int(probabilities.argmax().item())

    return {
        "class_id": prediction,
        "label": LABELS[prediction],
        "probabilities": [round(float(value), 6) for value in probabilities],
    }
