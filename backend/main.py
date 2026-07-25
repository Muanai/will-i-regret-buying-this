from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import httpx
from bs4 import BeautifulSoup
import os
import json

load_dotenv()

from sqlmodel import Field, SQLModel, create_engine, Session, select
from typing import Optional
from datetime import datetime, timezone
import uuid

# --- DATABASE SCHEMA ---
class UserProfile(SQLModel, table=True):
    __tablename__ = "users"
    id: str = Field(primary_key=True) # Akan diisi dengan user_id dari Clerk
    age: int
    occupation_status: str
    monthly_income: float
    monthly_expense: float
    current_savings: float
    financial_goal: str
    risk_tolerance: Optional[str] = "medium"

class AnalysisRecord(SQLModel, table=True):
    __tablename__ = "analyses"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    product_name: str
    category: str
    price: float
    reason: Optional[str] = None
    product_url: str
    urgency: Optional[str] = None
    suggested_risk_tier: str
    purchase_summary: str
    financial_impact_risk_tier: str
    financial_impact_reason: str
    behavioral_insight: str
    recommendation_action: str
    recommendation_alternative: str

# --- ENGINE SETUP ---
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("DATABASE_URL is utterly missing from the environment.")

# Neon merekomendasikan penonaktifan connection pooling di sisi SQLAlchemy untuk serverless
engine = create_engine(db_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

app = FastAPI(title="Will I Regret Buying This API")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    url: str

@app.get("/health")
def health_check():
    return {"status": "Engine is breathing"}

@app.post("/api/scrape")
async def scrape_product(req: ScrapeRequest):
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(
                req.url, 
                headers={
                    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
                    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
                }
            )
            response.raise_for_status()
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        og_title = soup.find("meta", property="og:title")
        title = og_title["content"] if og_title else (soup.title.string if soup.title else "")
        
        og_desc = soup.find("meta", property="og:description")
        meta_desc = soup.find("meta", {"name": "description"})
        desc_content = og_desc["content"] if og_desc else (meta_desc["content"] if meta_desc else "")
        
        raw_text = f"Title: {title}\nDescription: {desc_content}"
        
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(status_code=500, detail="Missing API Key")
        
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        prompt = f"""
        Extract the product name and map it to a category from this text.
        Categories: electronics, fashion, furniture, travel, education, other.
        Return ONLY valid JSON.
        Schema: {{"product_name": "string", "category": "string"}}
        Text: {raw_text}
        """
        
        ai_response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt,
        )
        cleaned_response = ai_response.text.strip().removeprefix("```json").removesuffix("```").strip()
        result = json.loads(cleaned_response)
        
        extracted_name = result.get("product_name", "").strip().lower()
        if not extracted_name or "shopee" in extracted_name and len(extracted_name) < 20:
            raise ValueError("Anti-bot blocked content extraction")
            
        return result
        
    except Exception as e:
        print(f"Scrape Error: {repr(e)}")
        raise HTTPException(status_code=400, detail="Could not auto-fetch product details. Please enter them manually.")

class ProfileCreateRequest(BaseModel):
    user_id: str
    age: int
    occupation_status: str
    monthly_income: float
    monthly_expense: float
    current_savings: float
    financial_goal: str
    risk_tolerance: Optional[str] = "medium"

@app.post("/api/profile")
def save_profile(profile: ProfileCreateRequest):
    with Session(engine) as session:
        # Periksa apakah profil sudah ada untuk menghindari duplikasi
        existing_user = session.get(UserProfile, profile.user_id)
        if existing_user:
            # Update data jika sudah ada
            for key, value in profile.dict().items():
                setattr(existing_user, key, value)
            db_user = existing_user
        else:
            db_user = UserProfile(**profile.dict())
            session.add(db_user)
            
        session.commit()
        session.refresh(db_user)
        return {"status": "success", "message": "Financial reality locked in database."}