from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import httpx
from bs4 import BeautifulSoup
import os
import json

load_dotenv()

app = FastAPI(title="Will I Regret Buying This API")

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
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Missing API Key")
        
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
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
        
        model = genai.GenerativeModel("gemini-flash-latest")
        prompt = f"""
        Extract the product name and map it to a category from this text.
        Categories: electronics, fashion, furniture, travel, education, other.
        Return ONLY valid JSON.
        Schema: {{"product_name": "string", "category": "string"}}
        Text: {raw_text}
        """
        
        ai_response = model.generate_content(prompt)
        cleaned_response = ai_response.text.strip().removeprefix("```json").removesuffix("```").strip()
        result = json.loads(cleaned_response)
        
        extracted_name = result.get("product_name", "").strip().lower()
        if not extracted_name or "shopee" in extracted_name and len(extracted_name) < 20:
            raise ValueError("Anti-bot blocked content extraction")
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not auto-fetch product details. Please enter them manually.")        