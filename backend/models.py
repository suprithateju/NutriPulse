from sqlalchemy import Column, Integer, String, Float, JSON, Date, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    age_group = Column(String)  # 'child', 'adult', 'old_age'
    dietary_pref = Column(String) # 'veg', 'non-veg'

class MealLog(Base):
    __tablename__ = "meal_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    meal_type = Column(String) # 'breakfast', 'lunch', 'dinner', 'snack'
    food_items = Column(JSON)
    calories = Column(Integer)

class NutrientIntake(Base):
    __tablename__ = "nutrient_intake"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    iron = Column(Float, default=0.0)
    calcium = Column(Float, default=0.0)
    b12 = Column(Float, default=0.0)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)

class DeficiencyResult(Base):
    __tablename__ = "deficiency_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    risks = Column(JSON)
    recommendations = Column(JSON)
