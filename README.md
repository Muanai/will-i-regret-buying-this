# Will I Regret Buying This?

An AI-powered financial conscience application that interrogates your impulse purchases before you make them. Built with a premium "Developer Tool" aesthetic, it forces you to face the financial consequences of your desires using hard data and an unapologetic AI.

## Features

- **The Interrogation Room:** Submit a product you want to buy, and the AI will cross-examine your decision based on your real financial DNA.
- **Two Oracles (Personalities):** Choose between *The Mentor* (wise, objective, supportive) or *The Roaster* (ruthless, sarcastic, merciless).
- **Defend Your Purchase:** An interactive chat interface allows you to argue your case before the AI delivers its final verdict.
- **The Verdict:** The AI will evaluate your purchase and return one of three verdicts: **Approve**, **Reject**, or **Delay**.
- **7-Day Waiting Room (Cooling-off Period):** Items that receive a "Delay" verdict are locked in a purgatory waiting room with a strict 7-day countdown timer to prevent impulse buying.
- **Real-Time URL Scraping:** Paste a product URL (Shopee, Tokopedia, Steam, etc.), and the system will automatically extract the product name and category using BeautifulSoup and Gemini fallback processing.
- **Financial DNA Profiling:** A complete breakdown of your cash on hand, monthly income, expenses, debt, and investments to ground the AI's logic.

## Tech Stack

### Frontend (Client)
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Custom Vanilla CSS (`globals.css`).
- **Authentication:** Clerk
- **Deployment Platform:** Vercel

### Backend (Server)
- **Framework:** FastAPI (Python)
- **ORM / Database Tools:** SQLModel, SQLAlchemy
- **Deployment Platform:** Northflank

### Database & External APIs
- **Database:** PostgreSQL hosted on Neon DB
- **AI / LLM:** Google Gemini API (`gemini-flash-lite-latest`)
- **Scraping:** HTTPX & BeautifulSoup4

## Project Structure

```text
c:\Workspace\projects\web\will-i-regret-buying-this\
├── backend/                       # FastAPI Backend
│   ├── main.py                    # Core backend logic, routing, AI prompts, and scraping
│   ├── requirements.txt           # Python dependencies
│   ├── time_travel.py             # Utility for development (modifying db timestamps)
│   └── .env                       # Backend secrets (Neon DB URL, Gemini API Key)
├── src/                           # Next.js Frontend
│   ├── app/
│   │   ├── globals.css            # Core design system, tokens, and animations
│   │   ├── layout.tsx             # Root layout with ClerkProvider
│   │   └── page.tsx               # Main Dashboard and Landing Page
│   └── components/
│       ├── AnalysisResult.tsx     # Renders the final AI verdict and stats
│       ├── ChatInterface.tsx      # Interactive chat for defending purchases
│       ├── ProductForm.tsx        # Left sidebar for submitting product/URL
│       └── ProfileForm.tsx        # Initial financial DNA setup form
├── DESIGN.md                      # UI/UX design language and philosophy rules
└── package.json                   # Frontend dependencies
```

## Database Schema

The database uses PostgreSQL via **Neon DB** and is managed by **SQLModel**.

### `users` Table
Stores the user's financial profile.
- `id` (String, Primary Key) - Matches the Clerk User ID.
- `name` (String, Optional)
- `age` (Int)
- `occupation_status` (String)
- `monthly_income` (Float)
- `monthly_expense` (Float)
- `cash_on_hand` (Float)
- `invested_amount` (Float)
- `current_debt` (Float)
- `dependents` (Int)
- `financial_goal` (String)
- `risk_tolerance` (String) - Default: "medium"

### `analyses` Table
Stores every product evaluation and verdict.
- `id` (String, UUID, Primary Key)
- `user_id` (String, Foreign Key -> `users.id`)
- `created_at` (Datetime, UTC) - Used for the 7-Day Waiting Room logic.
- `product_name` (String)
- `category` (String)
- `price` (Float)
- `product_url` (String)
- `reason`, `urgency`, `usage_frequency`, `purchase_motivation` (String, Optional)
- `regret_score` (Int, 1-100)
- `purchase_summary` (String)
- `quick_stats` (JSON String)
- `financial_impact_reason` (String)
- `behavioral_insight` (String)
- `recommendation_action` (String) - "Approve", "Delay", or "Reject".
- `recommendation_alternative` (String)

