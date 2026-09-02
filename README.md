# PneumoAI — AI-Powered Pneumonia Detection

A full-stack web application that detects pneumonia from chest X-rays using a custom-trained convolutional neural network. Upload an X-ray image and get an instant prediction backed by real PyTorch inference.

![Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat&logo=pytorch&logoColor=white)

---

## Demo

Upload a chest X-ray → the model processes it in real-time → returns a prediction with confidence score.

The frontend communicates with a FastAPI backend that loads the trained `pneumonia_model.pth` weights and runs inference on CPU.

---

## Architecture

### Model

A lightweight 2-layer CNN built for binary classification (normal vs pneumonia):

```
Input (1×34×34 grayscale)
  → Conv2d(1→16, 3×3) → ReLU → MaxPool(2)
  → Conv2d(16→32, 3×3) → ReLU → MaxPool(2)
  → Flatten
  → Linear(1568→64) → ReLU → Dropout(0.5)
  → Linear(64→1) → Sigmoid
Output: pneumonia probability (0.0–1.0)
```

- **105,281** trainable parameters
- Trained on [PneumoniaMNIST](https://medmnist.com/) for **10 epochs**
- Optimizer: Adam (lr=1e-3)
- Loss: BCEWithLogitsLoss

### Dataset

[PneumoniaMNIST](https://github.com/medmnist/medmnist) — a benchmark dataset of chest X-rays:

| Split | Images |
|-------|--------|
| Train | 5,856 |
| Val   | 634   |
| Test  | 624   |
| **Total** | **7,114** |

- 28×28 grayscale chest X-rays
- Binary labels: Normal (0) / Pneumonia (1)
- Class imbalance: ~73% pneumonia, ~27% normal
- Resized to 34×34 for inference (due to conv/pool dimensions)

### System

```
┌──────────────┐       POST /predict       ┌──────────────────┐
│              │  ──────────────────────▶   │                  │
│   React UI   │   (multipart/form-data)    │   FastAPI        │
│   (Vite)     │                            │   Backend        │
│              │  ◀──────────────────────   │                  │
└──────────────┘     JSON response          │  ┌────────────┐  │
     :5173                                  │  │ PyTorch    │  │
                                            │  │ pneumonia_ │  │
                                            │  │ model.pth  │  │
                                            │  └────────────┘  │
                                            └──────────────────┘
                                                 :8000
```

---

## Project Structure

```
pneumonia-detector/
├── backend/
│   ├── main.py              # FastAPI server + /predict endpoint
│   ├── model.py             # PneumoniaCNN architecture definition
│   ├── pneumonia_model.pth  # Trained model weights (415 KB)
│   └── requirements.txt
├── src/
│   ├── App.jsx              # React UI — upload, processing, result states
│   ├── index.css            # Tailwind + custom animations
│   └── main.jsx             # React entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── preview.html             # Self-contained CDN preview (no build needed)
```

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Starts the API server at `http://127.0.0.1:8000`.

### Frontend

```bash
npm install
npm run dev
```

Starts the dev server at `http://127.0.0.1:5173`.

### API

**Health check:**
```bash
curl http://127.0.0.1:8000/health
```

**Predict:**
```bash
curl -X POST http://127.0.0.1:8000/predict -F "file=@your_xray.png"
```

Response:
```json
{
  "label": "Pneumonia Detected",
  "confidence": "94.2%",
  "probability": 0.942,
  "inference_time_ms": 2.1,
  "input_size": "34x34",
  "device": "cpu"
}
```

---

## Training

The model was trained in Google Colab using the notebook included in this repository. Key details:

```python
# Dataset
train_dataset = PneumoniaMNIST(split='train', transform=data_transform, download=True)
val_dataset   = PneumoniaMNIST(split='val',   transform=data_transform, download=True)
test_dataset  = PneumoniaMNIST(split='test',  transform=data_transform, download=True)

# Preprocessing
transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5])
])

# Training config
EPOCHS = 10
optimizer = optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.BCEWithLogitsLoss()
batch_size = 64
```

To evaluate on the test set:
```python
model.eval()
correct, total = 0, 0
with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        labels = labels.to(device).float().squeeze(1)
        outputs = torch.sigmoid(model(images).squeeze(1))
        preds = (outputs > 0.5).float()
        correct += (preds == labels).sum().item()
        total += labels.size(0)
print(f'Test Accuracy: {100 * correct / total:.2f}%')
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Lucide React |
| Backend | FastAPI, Uvicorn, Pillow |
| ML | PyTorch, torchvision |
| Build | Vite 6 |
| Dataset | PneumoniaMNIST (via medmnist) |

---

## Limitations

- The model achieves reasonable accuracy on PneumoniaMNIST but is **not clinically validated**
- Input images are resized to 34×34 — significant detail loss from original X-rays
- Class imbalance (~73% pneumonia) may bias predictions toward the majority class
- No data augmentation was used during training
- This is a portfolio/demo project, not a medical device

---

## License

This project is for educational and portfolio purposes only. Not intended for clinical use.
