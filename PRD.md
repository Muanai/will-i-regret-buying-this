# PRD — "Will I Regret Buying This?"

*AI Purchase Decision Copilot — 24-Hour Hackathon Build*

**Note on this document.** This document uses a simplified writing style (based on ASD-STE100 principles). Sentences are short. Each instruction states one action. Terms are defined once, in the Glossary, and used the same way everywhere else in this document. Build the app to match this document exactly. If a rule here conflicts with a rule elsewhere, follow this document.

---

## 0. Glossary

Use these terms only. Do not use synonyms for them.

| Term | Meaning |
|---|---|
| User | The person who uses the app. |
| Profile | The financial data the User enters about themselves. |
| Product | The item the User wants to buy. |
| Analysis | The output the app generates after it processes the Profile and the Product. |
| Risk Tier | One value: `Low`, `Medium`, or `High`. It shows the financial risk of the purchase. |
| LLM | The language model API. The app sends it a prompt and gets text back. |
| Backend | The FastAPI service. It runs the calculations and calls the LLM. |
| Frontend | The Next.js app. The User sees and interacts with it. |

---

## 1. Product Overview

**Working title:** Will I Regret Buying This?
**One-line description:** An AI copilot that checks a purchase against your finances before you buy.

### Problem

Many people buy things because of a discount, a trend, or a feeling. They do not check the purchase against their own finances first. Financial literacy content teaches concepts. It does not help at the moment of a purchase decision.

### Solution

The app asks the User for basic financial data (the Profile) and details about an item (the Product). The app then produces an Analysis. The Analysis has four parts: a summary, a financial impact, a behavioral insight, and a recommendation.

---

## 2. Target User

Primary target: people aged 18–30 in an early career stage (student, fresh graduate, young professional). This group buys many items online and has little structured decision support at the point of purchase.

---

## 3. Core User Flow

```
User enters Profile
        ↓
User enters Product
        ↓
Backend calculates financial ratios
        ↓
Backend sends ratios + Profile + Product to LLM
        ↓
LLM returns Analysis (JSON)
        ↓
Frontend displays Analysis
```

---

## 4. Feature Scope

Build exactly these three features. Do not add other features.

### Feature 1 — Profile Form

The Frontend must show a form. The form collects the fields in Section 5. The Frontend must mark each field as required or optional, exactly as Section 5 states.

### Feature 2 — Product Form

The Frontend must show a form. The form collects the fields in Section 6.

### Feature 3 — Analysis Engine

The Backend must:
1. Calculate the ratios in Section 7.
2. Build the prompt in Section 8.
3. Call the LLM with that prompt.
4. Save the Profile, the Product, and the Analysis to the database. See Section 10.
5. Return the LLM's JSON response to the Frontend.

---

## 5. Profile Fields

| Field | Type | Required | Default / Rule |
|---|---|---|---|
| `name` | text | No | If empty, use "you" in generated text. |
| `age` | number | Yes | — |
| `occupation_status` | enum: `student`, `fresh_graduate`, `employee`, `freelancer` | Yes | — |
| `monthly_income` | number | Yes | Can be `0`. See Section 9. |
| `monthly_expense` | number | Yes | — |
| `current_savings` | number | Yes | Default `0` if the User leaves it empty. Show a warning: "Result is less accurate without savings data." |
| `financial_goal` | enum: `emergency_fund`, `debt_free`, `saving_for_something`, `start_investing`, `no_specific_goal` | Yes | — |
| `risk_tolerance` | enum: `low`, `medium`, `high` | No | Default `medium`. Skip this field first if you run out of time. |

---

## 6. Product Fields

| Field | Type | Required | Default / Rule |
|---|---|---|---|
| `product_name` | text | Yes | — |
| `category` | enum: `electronics`, `fashion`, `furniture`, `travel`, `education`, `other` | Yes | Use an enum, not free text. This keeps the LLM's input consistent. |
| `price` | number | Yes | — |
| `reason` | text | Yes | If the text has fewer than 5 words, ask the User for more detail before they submit the form. |
| `product_url` | text | No | The app does not fetch or read this URL. |
| `urgency` | enum: `immediate_need`, `can_wait` | No | Skip this field first if you run out of time. |

---

## 7. Calculation Layer

Run these calculations in the Backend. Do this before you call the LLM. Do not ask the LLM to calculate these values. This keeps the numbers correct and the response fast.

```
disposable_income         = monthly_income - monthly_expense
price_to_income_ratio     = price / monthly_income          # see Section 9 if monthly_income = 0
price_to_savings_ratio    = price / current_savings          # see Section 9 if current_savings = 0
estimated_recovery_months = price / max(disposable_income, 1)
```

Use this table to set `suggested_risk_tier`:

| `price_to_income_ratio` | `suggested_risk_tier` |
|---|---|
| < 10% | `Low` |
| 10%–30% | `Medium` |
| > 30% | `High` |

Send `suggested_risk_tier` to the LLM. The LLM may adjust the wording around it, but it must not output a different tier without a stated reason grounded in the Profile.

---

## 8. LLM Prompt

Use this system prompt exactly:

```
You are a financial decision analysis engine embedded in a purchase-decision app.
You receive a user's financial profile, a product they are considering, and
pre-calculated financial ratios. Do three things:
1. Confirm or adjust the suggested risk tier, using the user's goal and
   occupation status as context.
2. State the likely psychological driver behind the purchase, based on the
   user's stated reason.
3. Give one practical recommendation.

Reply with only valid JSON. Do not use markdown fences. Do not add comments.
Match this schema exactly:

{
  "purchase_summary": string,
  "financial_impact": {
    "risk_tier": "Low" | "Medium" | "High",
    "reason": string
  },
  "behavioral_insight": string,
  "recommendation": {
    "action": string,
    "alternative": string
  }
}
```

Use this user prompt template. Fill in each `{field}` with the matching value from the Profile, the Product, and Section 7.

```
User Profile:
- Age: {age}, Occupation: {occupation_status}
- Monthly Income: {monthly_income}
- Monthly Expense: {monthly_expense}
- Current Savings: {current_savings}
- Financial Goal: {financial_goal}

Product:
- Name: {product_name} ({category})
- Price: {price}
- Reason for purchase: "{reason}"

Pre-calculated:
- price_to_income_ratio: {price_to_income_ratio}
- price_to_savings_ratio: {price_to_savings_ratio}
- estimated_recovery_months: {estimated_recovery_months}
- suggested_risk_tier: {suggested_risk_tier}
```

Recommended LLM provider: the Gemini API. Any suggestion and changes along the development are welcome while sticking to the free tier plan.

---

## 9. Edge Cases

Handle each case exactly as stated.

| Case | Rule |
|---|---|
| `monthly_income = 0` | Skip `price_to_income_ratio`. Base `suggested_risk_tier` on `price_to_savings_ratio` only. |
| `current_savings = 0` | Continue normally. Add a note inside `financial_impact.reason`: "Limited savings data available." |
| `reason` has fewer than 5 words | Block form submission. Show: "Please describe your reason in a bit more detail." |
| `price` > 12 × `monthly_income` | Continue normally. In `recommendation.action`, suggest an installment or savings plan, not a generic "wait 30 days" message. |

---

## 10. API Contract

**Database requirement.** This project must use an external database. Use Neon (Postgres). Neon is a managed external database, so it satisfies this rule.

### Database Schema

Use one table. Do not split this into multiple tables for the MVP.

Table: `analyses`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | |
| `created_at` | timestamp | set automatically |
| `age` | integer | |
| `occupation_status` | text | |
| `monthly_income` | numeric | |
| `monthly_expense` | numeric | |
| `current_savings` | numeric | |
| `financial_goal` | text | |
| `risk_tolerance` | text, nullable | |
| `product_name` | text | |
| `category` | text | |
| `price` | numeric | |
| `reason` | text | |
| `product_url` | text, nullable | |
| `urgency` | text, nullable | |
| `suggested_risk_tier` | text | from Section 7 |
| `purchase_summary` | text | from the LLM response |
| `financial_impact_risk_tier` | text | from the LLM response |
| `financial_impact_reason` | text | from the LLM response |
| `behavioral_insight` | text | from the LLM response |
| `recommendation_action` | text | from the LLM response |
| `recommendation_alternative` | text | from the LLM response |

The Frontend does not read this table. The table exists to persist each analysis, as the hackathon rules require.

### `POST /api/analyze`

Send the full Profile and Product in one request. No separate profile-creation endpoint is required.

Request body:

```json
{
  "profile": {
    "name": "string, optional",
    "age": "number",
    "occupation_status": "student | fresh_graduate | employee | freelancer",
    "monthly_income": "number",
    "monthly_expense": "number",
    "current_savings": "number",
    "financial_goal": "emergency_fund | debt_free | saving_for_something | start_investing | no_specific_goal",
    "risk_tolerance": "low | medium | high, optional"
  },
  "product": {
    "product_name": "string",
    "category": "electronics | fashion | furniture | travel | education | other",
    "price": "number",
    "reason": "string",
    "product_url": "string, optional",
    "urgency": "immediate_need | can_wait, optional"
  }
}
```

Response body: the exact JSON schema from Section 8.

Backend steps for this endpoint:
1. Calculate the ratios (Section 7).
2. Build the prompt and call the LLM (Section 8).
3. Insert one row into `analyses` with the Profile fields, the Product fields, and the LLM's Analysis fields.
4. Return the Analysis JSON to the Frontend.

---

## 11. Tech Stack

| Layer | Technology | Deploy Target |
|---|---|---|
| Frontend | Next.js (App Router, TypeScript), Tailwind CSS | Vercel |
| Backend | Python, FastAPI | Render (Web Service) |
| Database | Postgres | Neon |
| ORM | SQLModel | — |
| LLM | Gemini API, or any free provider with strict JSON output | — |

Reasons for these choices:
- Next.js deploys on Vercel with no extra configuration.
- FastAPI deploys on Render as a standard web service.
- SQLModel connects to Neon with one connection string. It needs less setup than a full ORM.
- Neon is a managed external database. It satisfies the hackathon's database requirement and needs no server management.

Build note:
- Render free-tier web services sleep after a period of inactivity. Wake the Backend a few minutes before the demo, or the first request will be slow.

Required environment variables:

```
DATABASE_URL      # Neon connection string
LLM_API_KEY       # key for the chosen LLM provider
CORS_ORIGIN       # the Vercel Frontend URL, set on the Backend
```

---

## 12. UI Screens

Build exactly three screens.

1. **Profile Setup** — one form, with the fields from Section 5. Mark required fields clearly.
2. **Product Input** — one form, with the fields from Section 6. Use a multi-line text area for `reason`.
3. **Decision Report** — shows the Analysis. Use a colored badge for `risk_tier` (green = Low, yellow = Medium, red = High). Show `purchase_summary`, `behavioral_insight`, and `recommendation`. Add two buttons: "Check another product" and "Edit profile."

---

## 13. 24-Hour Timeline

| Hours | Task |
|---|---|
| 0–2 | Set up the repo. Create the Neon project and the `analyses` table. Set up the Frontend and Backend skeletons. Deploy an empty version to Vercel and Render. |
| 2–5 | Build the Profile form. |
| 5–6 | Build the Product form. |
| 6–10 | Build the calculation layer (Section 7). Connect the LLM prompt (Section 8). Write each result to the `analyses` table. Test the JSON output. |
| 10–12 | Build the Decision Report screen. Parse the JSON response into the UI. |
| 12–14 | Test the full flow, start to finish. |
| 14–16 | Polish the UI. |
| 16–18 | Prepare 3 demo scenarios (Low, Medium, High risk) with pre-tested numbers. |
| 18–20 | Record a backup demo video. |
| 20–22 | Prepare the pitch narrative. |
| 22–24 | Rehearse. Fix remaining bugs. Submit. |

---

## 14. Demo Script

Run these 3 scenarios in order, so the Risk Tier changes visibly each time:

1. **Low risk** — a cheap item relative to income (example: a $20 book).
2. **Medium risk** — a mid-price item (example: $150 earphones).
3. **High risk** — a large or impulsive purchase (example: a $999 phone, reason: "lifestyle upgrade").

---

## 15. Non-Goals

Do not build these features:

- Automatic expense tracking
- Bank account integration
- Investment recommendations
- Email notifications
- A general-purpose financial chatbot
- Long-term financial coaching
- OCR for marketplace screenshots
