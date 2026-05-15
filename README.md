# 🫀 NutriPulse

> **Smart nutrition tracking for every age — powered by AI**

NutriPulse is an AI-powered food calorie and diet tracker built for Indian users. It combines computer vision-based plate analysis with a clinical deficiency predictor, all personalized to three life stages: **Child**, **Adult**, and **Old Age**. Built with Next.js, FastAPI, and Google Gemini 2.5 Flash.

## ✨ Features

### 🤖 AI-Powered (Gemini 2.5 Flash)

- **AI Plate Analysis** — Upload a meal photo; it identifies Indian dishes, estimates portions, and returns total calories + macronutrient breakdown (carbs, protein, fat)
- **Clinical Deficiency Predictor** — Input symptoms and age group; the AI predicts top nutrient deficiency risks (Iron, B12, Vitamin D, etc.) and recommends 3 targeted Indian food fixes per risk

### 📊 Tracking & Analytics

- **Caloric Diary** — Persistent meal logging stored in SQLite; supports Breakfast, Lunch, Dinner, and Snacks
- **Weekly Overview** — Daily caloric intake vs. personalized age-group targets visualized over 7 days
- **Weekly Nutrient Gaps** — Tracks Iron, Calcium, Protein, and Vitamin B12 against recommended daily values and highlights deficiency gaps

### 👤 Personalization & UX

- **Age Group Selector** — Child (2–12) / Adult (13–59) / Old Age (60+); changes calorie targets, nutrient thresholds, and risk flags throughout the app
- **Meal Recommendations** — Daily Breakfast, Lunch, and Dinner suggestions adapting to age group and dietary preference (Veg / Non-Veg)
- **Onboarding Flow** — Profile setup capturing age group, dietary preference, and health goals to calibrate all targets
- **Centralized Dashboard** — Unified view of daily summary, calorie ring, recent meal logs, and nutritional status

---

## 🛠️ Tech Stack

### Frontend
Next.js (App Router) 
· TypeScript 
· Tailwind CSS v4 
· Framer Motion 
· Recharts · Zustand 
· React Hook Form + Zod 
· Axios 
· Lucide React 
· jsPDF

### Backend
FastAPI 
· SQLite 
· SQLAlchemy 
· Pydantic 
· Google Generative AI SDK (Gemini 2.5 Flash) 
· python-dotenv

---

## 🎯 Age Group Personalization

| | 👶 Child (2–12) | 🧑 Adult (13–59) | 👴 Old Age (60+) |
|---|---|---|---|
| Calorie Target | 1200–1600 kcal | 1800–2500 kcal | 1400–1800 kcal |
| Key Nutrients | Iron, Calcium, Zinc | B12, Iron, Magnesium | Calcium, B12, Protein |
| Risk Focus | Growth & Development | Metabolic Health | Bone & Muscle |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini 2.5 Flash)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nutripulse.git
cd nutripulse
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000` · API docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local      # Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Frontend runs at `http://localhost:3000`


