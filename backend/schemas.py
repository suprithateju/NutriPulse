from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date

class UserBase(BaseModel):
    name: str
    email: str
    age_group: str
    dietary_pref: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class MealLogBase(BaseModel):
    date: date
    meal_type: str
    food_items: List[Dict[str, Any]]
    calories: int

class MealLogCreate(MealLogBase):
    pass

class MealLog(MealLogBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True
