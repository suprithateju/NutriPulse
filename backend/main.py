from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import models
import schemas
import database
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="NutriPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
class ProfileSetupRequest(BaseModel):
    name: str
    age_group: str
    dietary_pref: str

@app.post("/api/profile/setup")
def setup_profile(req: ProfileSetupRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.name == req.name).first()
    if not user:
        user = models.User(name=req.name, email=f"{req.name.lower().replace(' ', '')}@example.com", age_group=req.age_group, dietary_pref=req.dietary_pref)
        db.add(user)
    else:
        user.age_group = req.age_group
        user.dietary_pref = req.dietary_pref
    db.commit()
    db.refresh(user)
    return {"user_id": user.id, "name": user.name}

class PlateAnalyseRequest(BaseModel):
    image_base64: str

@app.post("/api/analyse/plate")
def analyse_plate(req: PlateAnalyseRequest):
    if req.image_base64 == "dummy_base64_string":
        # Fallback if no real image
        return {
            "food_items": [
                {"name": "Dal (Lentils)", "portion": "1 bowl", "calories": 220, "flags": []},
                {"name": "White Rice", "portion": "1 plate", "calories": 240, "flags": ["High Carbs"]}
            ],
            "total_calories": 460,
            "macros": {"carbs": 80, "protein": 15, "fat": 5}
        }

    try:
        if req.image_base64.startswith("data:image"):
            mime_type = req.image_base64.split(";")[0].split(":")[1]
            base64_data = req.image_base64.split(",")[1]
        else:
            mime_type = "image/jpeg"
            base64_data = req.image_base64

        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = """
        You are an expert nutritionist and computer vision AI. 
        Analyze this image of a meal (specifically looking for Indian foods if applicable).
        Return ONLY a raw JSON response (no markdown blocks, no formatting, just pure JSON).
        The JSON structure MUST exactly match this:
        {
            "food_items": [
                {"name": "Food Name", "portion": "1 bowl/plate/etc", "calories": 200, "flags": ["High Carbs", "Protein Rich"]}
            ],
            "total_calories": 500,
            "macros": {"carbs": 50, "protein": 20, "fat": 10}
        }
        Make sure to estimate the portion and macros as accurately as possible.
        """
        response = model.generate_content([
            {"mime_type": mime_type, "data": base64_data},
            prompt
        ])
        
        resp_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(resp_text)
    except Exception as e:
        print(f"Gemini Error: {e}")
        # Fallback to mock
        return {
            "food_items": [
                {"name": "Dal (Lentils)", "portion": "1 bowl", "calories": 220, "flags": []},
                {"name": "White Rice", "portion": "1 plate", "calories": 240, "flags": ["High Carbs"]}
            ],
            "total_calories": 460,
            "macros": {"carbs": 80, "protein": 15, "fat": 5}
        }

class DeficiencyPredictRequest(BaseModel):
    symptoms: List[str]
    age_group: str

@app.post("/api/deficiency/predict")
def predict_deficiency(req: DeficiencyPredictRequest):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are an expert clinical nutritionist. The user is in the '{req.age_group}' age group and is experiencing the following symptoms:
        {', '.join(req.symptoms)}
        
        Return ONLY a raw JSON response (no markdown) with the top 2 likely nutrient deficiency risks and 3 Indian food recommendations for each to fix them.
        Format MUST exactly match this:
        {{
            "top_risks": [
                {{"nutrient": "Iron", "risk_score": 0.85, "recommendations": ["Spinach", "Lentils", "Jaggery"]}},
                {{"nutrient": "Vitamin B12", "risk_score": 0.70, "recommendations": ["Curd", "Fortified Cereals"]}}
            ]
        }}
        The risk_score should be between 0.0 and 1.0.
        """
        response = model.generate_content(prompt)
        resp_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(resp_text)
    except Exception as e:
        print(f"Gemini Error: {e}")
        # Fallback to mock
        if req.age_group == "child":
            return {
                "top_risks": [
                    {"nutrient": "Iron", "risk_score": 0.85, "recommendations": ["Spinach", "Lentils", "Jaggery"]},
                    {"nutrient": "Calcium", "risk_score": 0.70, "recommendations": ["Milk", "Ragi", "Curd"]}
                ]
            }
        elif req.age_group == "old_age":
            return {
                "top_risks": [
                    {"nutrient": "Calcium", "risk_score": 0.90, "recommendations": ["Milk", "Soft Paneer"]},
                    {"nutrient": "B12", "risk_score": 0.80, "recommendations": ["Fortified Foods", "Dairy"]}
                ]
            }
        else:
            return {
                "top_risks": [
                    {"nutrient": "B12", "risk_score": 0.75, "recommendations": ["Dairy", "Fortified cereals"]},
                    {"nutrient": "Vitamin D", "risk_score": 0.65, "recommendations": ["Sunlight", "Mushrooms"]}
                ]
            }

class LogMealRequest(BaseModel):
    user_id: int
    meal_type: str
    food_items: str
    calories: int

@app.post("/api/diary/log")
def log_meal(req: LogMealRequest, db: Session = Depends(database.get_db)):
    from datetime import date
    log = models.MealLog(user_id=req.user_id, date=date.today(), meal_type=req.meal_type, food_items=req.food_items, calories=req.calories)
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"status": "success"}

@app.get("/api/diary/week")
def get_weekly_diary(user_id: int = 1, db: Session = Depends(database.get_db)):
    from datetime import date, timedelta
    today = date.today()
    start_date = today - timedelta(days=6)
    
    logs = db.query(models.MealLog).filter(models.MealLog.user_id == user_id, models.MealLog.date >= start_date).all()
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    target = 1800
    if user:
        target = 1400 if user.age_group == "child" else (1600 if user.age_group == "old_age" else 2000)
    
    daily_cals = {}
    for d in range(7):
        day_date = start_date + timedelta(days=d)
        daily_cals[day_date] = {"cals": 0, "logs": []}
        
    for log in logs:
        if log.date in daily_cals:
            daily_cals[log.date]["cals"] += log.calories
            daily_cals[log.date]["logs"].append(log.food_items)
            
    result = []
    for d, data in daily_cals.items():
        cals = data["cals"]
        status = "good" if abs(cals - target) <= 200 else ("over" if cals > target + 200 else "under")
        if cals == 0: status = "under"
        result.append({
            "day": d.strftime("%a"),
            "date": d.isoformat(),
            "calories": cals,
            "target": target,
            "status": status,
            "items": ", ".join(data["logs"]) if data["logs"] else "No meals logged"
        })
    return result

@app.get("/api/nutrients/weekly")
def get_weekly_nutrients(age_group: str = "adult"):
    # Mock nutrient gaps based on age group
    return [
        {"nutrient": "Iron", "actual": 12, "target": 10 if age_group == "child" else 18, "unit": "mg"},
        {"nutrient": "Calcium", "actual": 600, "target": 1200 if age_group == "old_age" else 1000, "unit": "mg"},
        {"nutrient": "Protein", "actual": 45, "target": 60 if age_group == "adult" else 50, "unit": "g"},
        {"nutrient": "Vitamin B12", "actual": 1.2, "target": 2.4, "unit": "mcg"}
    ]

@app.get("/api/recommendations/meals")
def get_meal_recommendations(age_group: str = "adult", pref: str = "veg"):
    # Mock meal recommendations
    meals = [
        {"type": "Breakfast", "name": "Moong Dal Chilla with Paneer", "calories": 320, "focus": "Protein & Iron"},
        {"type": "Lunch", "name": "Rajma Chawal with Spinach Raita", "calories": 450, "focus": "Iron & Calcium"},
        {"type": "Dinner", "name": "Khichdi with Ghee and Roasted Papad", "calories": 300, "focus": "Easy Digestion"}
    ]
    
    if pref == "non-veg":
        meals[1] = {"type": "Lunch", "name": "Chicken Curry with Roti", "calories": 500, "focus": "High Protein & B12"}
        
    if age_group == "child":
        meals[0]["name"] = "Paneer Stuffed Paratha with Curd"
        meals[0]["focus"] = "Calcium & Growth"
        
    return meals

