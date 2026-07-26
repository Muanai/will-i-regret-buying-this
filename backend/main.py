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
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid

# --- DATABASE SCHEMA ---
class UserProfile(SQLModel, table=True):
    __tablename__ = "users"
    id: str = Field(primary_key=True) # Akan diisi dengan user_id dari Clerk
    name: Optional[str] = None
    age: int
    occupation_status: str
    monthly_income: float
    monthly_expense: float
    cash_on_hand: float = Field(default=0.0)
    invested_amount: float = Field(default=0.0)
    current_debt: float = Field(default=0.0)
    dependents: int = Field(default=0)
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
    usage_frequency: Optional[str] = None
    purchase_motivation: Optional[str] = None
    regret_score: int
    purchase_summary: str
    quick_stats: str = Field(default="[]")
    financial_impact_reason: str
    behavioral_insight: str
    recommendation_action: str
    recommendation_alternative: str

from sqlalchemy.pool import NullPool

# --- ENGINE SETUP ---
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("DATABASE_URL is utterly missing from the environment.")

# Neon merekomendasikan penonaktifan connection pooling di sisi SQLAlchemy untuk serverless
engine = create_engine(db_url, echo=False, poolclass=NullPool)

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
        Categories: electronics, fashion, furniture, vehicle, hobby, entertainment, health_beauty, home, travel, education, other.
        Return ONLY valid JSON.
        Schema: {{"product_name": "string", "category": "string"}}
        Text: {raw_text}
        """
        
        ai_response = client.models.generate_content(
            model='gemini-flash-lite-latest',
            contents=prompt,
        )
        cleaned_response = ai_response.text.strip().removeprefix("```json").removesuffix("```").strip()
        result = json.loads(cleaned_response)
        
        extracted_name = result.get("product_name", "").strip()
        
        # Anti-bot fallback: If title is generic "Shopee" or very short, try to extract from URL
        if not extracted_name or ("shopee" in extracted_name.lower() and len(extracted_name) < 20):
            try:
                # e.g. https://shopee.co.id/Sony-Alpha-A7-Mark-III-Body-Only-Kamera-Mirrorless-i...
                from urllib.parse import urlparse
                path = urlparse(req.url).path
                # get the first meaningful segment
                segments = [s for s in path.split('/') if s]
                if segments:
                    slug = segments[0]
                    if slug == "product" and len(segments) > 1:
                        slug = segments[1]
                    extracted_name = slug.replace("-", " ").title()
                    result["product_name"] = extracted_name
                    result["category"] = "other" # Fallback category
            except:
                raise ValueError("Anti-bot blocked content extraction and URL parsing failed")
            
        return result
        
    except Exception as e:
        print(f"Scrape Error: {repr(e)}")
        raise HTTPException(status_code=400, detail="Could not auto-fetch product details. Please enter them manually.")


class ProfileCreateRequest(BaseModel):
    user_id: str
    name: Optional[str] = None
    age: int
    occupation_status: str
    monthly_income: float
    monthly_expense: float
    cash_on_hand: float
    invested_amount: float
    current_debt: float = 0.0
    dependents: int = 0
    financial_goal: str
    risk_tolerance: Optional[str] = "medium"

@app.post("/api/profile")
def save_profile(profile: ProfileCreateRequest):
    with Session(engine) as session:
        existing_user = session.get(UserProfile, profile.user_id)
        
        profile_data = profile.model_dump() if hasattr(profile, "model_dump") else profile.dict()
        
        profile_id = profile_data.pop("user_id")
        profile_data["id"] = profile_id
        
        if existing_user:
            for key, value in profile_data.items():
                setattr(existing_user, key, value)
            db_user = existing_user
        else:
            db_user = UserProfile(**profile_data)
            session.add(db_user)
            
        session.commit()
        session.refresh(db_user)
        return {"status": "success", "message": "Financial reality locked in database."}

@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    with Session(engine) as session:
        user = session.get(UserProfile, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")
        return user

class AnalyzeRequest(BaseModel):
    user_id: str
    product_url: str
    product_name: str
    category: str
    price: float
    reason: Optional[str] = ""
    urgency: Optional[str] = ""
    usage_frequency: Optional[str] = ""
    purchase_motivation: Optional[str] = ""
    personality: Optional[str] = "roaster"
    chat_history: Optional[List[Dict[str, Any]]] = []

@app.post("/api/analyze")
def analyze_purchase(req: AnalyzeRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Missing API Key")

    with Session(engine) as session:
        user = session.get(UserProfile, req.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User profile not found. Are you a ghost?")

        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        disposable_income = user.monthly_income - user.monthly_expense
        price_to_disposable_ratio = (req.price / disposable_income) * 100 if disposable_income > 0 else 999

        chat_context = ""
        if req.chat_history:
            chat_context = "\n[CONVERSATION HISTORY]\n"
            for msg in req.chat_history:
                role = "USER" if msg.get("role") == "user" else "YOU (AI)"
                chat_context += f"{role}: {msg.get('content')}\n"

        if req.personality == "mentor":
            system_instruction = """
            You are a trusted, warm-hearted, and brilliant financial mentor — think of a brilliant older sibling who genuinely wants you to win with money.
            
            CORE PHILOSOPHY: You believe in people's potential. You never shame. You never condescend. You educate, illuminate, and then empower.
            
            RULE 1 — TONE: Always open with a warm, non-judgmental acknowledgment. Then pivot to an insightful observation they may not have considered. Never use words like "meager", "dangerously", "barely", "thin", or any language that makes the user feel stupid or judged.
            
            RULE 2 — FOR LEISURE / HOBBY PURCHASES: Acknowledge the emotional value of rest and fun — they are real and important. Then do the math transparently: show them the cost as a percentage of their disposable income, not as a threat. Help them see if it's genuinely affordable.
            
            RULE 3 — FOR PRODUCTIVE TOOLS: Validate their ambition. Help them calculate the real ROI at their current income level. Ask what specific problem this solves or what goal it accelerates.
            
            RULE 4 — WHEN ASKING A QUESTION: Ask only one clear, curious question — like a mentor probing to understand their situation better, not a prosecutor cross-examining. The question should feel like a conversation, not an interrogation.
            
            Tone: Warm, curious, insightful, like a knowledgeable friend over coffee.
            """
        else:
            system_instruction = """
            Act as a ruthless, sarcastic, and highly analytical financial roaster.
            Your goal is to destroy financial delusions with dark humor and brutal honesty.
            RULE 1: If the item is a luxury or driven by vanity, tear down their delusion mercilessly.
            RULE 2: If it's a clear TOOL OF PRODUCTION, do not insult the necessity. Instead, ruthlessly evaluate if they actually deserve this specific expensive tier based on their current income.
            Tone: Sadistic, poetic, brutally pragmatic.
            """

        prompt = f"""
        {system_instruction}

        Analyze this potential purchase based on the user's harsh financial reality.

        [USER FINANCIAL REALITY]
        Age: {user.age}
        Occupation: {user.occupation_status}
        Dependents: {user.dependents}
        Monthly Income: IDR {user.monthly_income}
        Monthly Expense: IDR {user.monthly_expense}
        Disposable Income: IDR {disposable_income}
        Liquid Cash (Emergency Fund): IDR {user.cash_on_hand}
        Invested Assets: IDR {user.invested_amount}
        Current Debt / Paylater: IDR {user.current_debt}
        Total Net Worth: IDR {user.cash_on_hand + user.invested_amount - user.current_debt}
        Financial Goal: {user.financial_goal}

        [THE OBJECT OF DESIRE]
        Item: {req.product_name}
        Category: {req.category}
        Price: IDR {req.price} (This is {price_to_disposable_ratio:.1f}% of their monthly disposable income)
        Stated Reason: {req.reason}
        Motivation: {req.purchase_motivation}
        Usage Frequency: {req.usage_frequency}
        Urgency: {req.urgency}
        {chat_context}

        INSTRUCTIONS:
        You are an interactive AI Copilot. 
        1. ALWAYS interrogate the user FIRST if their initial reasoning is short, vague, or weak (less than 3 sentences). Do not give a verdict immediately. Ask a piercing, sarcastic, or deeply analytical question to dig deeper into their psychology. Keep it under 3 sentences.
        2. If the user asks a follow-up question or defends themselves, engage with them. Challenge their logic.
        3. Only when you are absolutely satisfied (or completely disgusted) and have no more questions, deliver your FINAL VERDICT. Do not ask a question if you are giving a verdict.

        Return ONLY a valid JSON object. Do not include markdown formatting like ```json.
        
        If you choose to ask a question or respond to the user's defense, use this exact schema:
        {{
            "type": "question",
            "message": "Your ruthless question here"
        }}

        If you choose to deliver the final verdict, use this exact schema:
        {{
            "type": "verdict",
            "regret_score": 85, 
            "quick_stats": [
                {{"label": "Cost vs Income", "value": "15%"}},
                {{"label": "Recovery Time", "value": "3 Months"}}
            ],
            "purchase_summary": "One punchy, poetic sentence summarizing the absurdity or validity of this purchase",
            "financial_impact_reason": "A ruthless breakdown of how this ruins or fits their financial goal",
            "behavioral_insight": "A skeptical psychological analysis of why they actually want this",
            "recommendation_action": "Buy | Delay | Drop",
            "recommendation_alternative": "A practical, cheaper alternative or a better use for this specific amount of money"
        }}
        """

        try:
            ai_response = client.models.generate_content(
                model='gemini-flash-lite-latest',
                contents=prompt,
            )
            cleaned_response = ai_response.text.strip().removeprefix("```json").removesuffix("```").strip()
            result = json.loads(cleaned_response)

            if result.get("type") == "verdict":
                analysis_record = AnalysisRecord(
                    user_id=user.id,
                    product_name=req.product_name,
                    category=req.category,
                    price=req.price,
                    reason=req.reason,
                    product_url=req.product_url,
                    urgency=req.urgency,
                    usage_frequency=req.usage_frequency,
                    purchase_motivation=req.purchase_motivation,
                    regret_score=int(result.get("regret_score", 100)),
                    purchase_summary=result.get("purchase_summary", ""),
                    quick_stats=json.dumps(result.get("quick_stats", [])),
                    financial_impact_reason=result.get("financial_impact_reason", ""),
                    behavioral_insight=result.get("behavioral_insight", ""),
                    recommendation_action=result.get("recommendation_action", "Drop"),
                    recommendation_alternative=result.get("recommendation_alternative", "")
                )
                session.add(analysis_record)
                session.commit()

            return result

        except Exception as e:
            print(f"Analyze Error: {repr(e)}")
            raise HTTPException(status_code=500, detail=str(e))