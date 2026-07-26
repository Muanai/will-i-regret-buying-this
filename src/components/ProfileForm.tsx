"use client";

import { useState, useEffect } from "react";

export default function ProfileForm({
    onComplete,
    initialData
}: {
    onComplete: (data: any) => void | Promise<void>;
    initialData?: any;
}) {
    const formatIDR = (value: string | number) => {
        if (value === undefined || value === null) return "";
        const raw = String(value).replace(/\D/g, "");
        if (!raw) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(raw, 10));
    };

    const [income, setIncome] = useState(initialData?.monthly_income !== undefined ? formatIDR(initialData.monthly_income) : "");
    const [expense, setExpense] = useState(initialData?.monthly_expense !== undefined ? formatIDR(initialData.monthly_expense) : "");
    const [cashOnHand, setCashOnHand] = useState(initialData?.cash_on_hand !== undefined ? formatIDR(initialData.cash_on_hand) : "");
    const [investedAmount, setInvestedAmount] = useState(initialData?.invested_amount !== undefined ? formatIDR(initialData.invested_amount) : "");
    const [currentDebt, setCurrentDebt] = useState(initialData?.current_debt !== undefined ? formatIDR(initialData.current_debt) : "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setIncome(formatIDR(initialData.monthly_income));
            setExpense(formatIDR(initialData.monthly_expense));
            setCashOnHand(formatIDR(initialData.cash_on_hand));
            setInvestedAmount(formatIDR(initialData.invested_amount));
            setCurrentDebt(formatIDR(initialData.current_debt || 0));

            const form = document.querySelector('form') as HTMLFormElement;
            if (form) {
                const nameInput = form.elements.namedItem('name') as HTMLInputElement;
                if (nameInput) nameInput.value = initialData.name || "";
                
                const ageInput = form.elements.namedItem('age') as HTMLInputElement;
                if (ageInput) ageInput.value = initialData.age || "";

                const depInput = form.elements.namedItem('dependents') as HTMLInputElement;
                if (depInput) depInput.value = initialData.dependents !== undefined ? initialData.dependents : "0";
                
                const occSelect = form.elements.namedItem('occupation_status') as HTMLSelectElement;
                if (occSelect) occSelect.value = initialData.occupation_status || "student";
                
                const goalSelect = form.elements.namedItem('financial_goal') as HTMLSelectElement;
                if (goalSelect) goalSelect.value = initialData.financial_goal || "emergency_fund";
            }
        }
    }, [initialData]);

    const handleCurrencyChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setter(formatIDR(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());

            const parseNumber = (val: string) => parseInt(val.replace(/\D/g, "") || "0", 10);

            const payload = {
                name: data.name,
                age: parseInt(data.age as string, 10),
                occupation_status: data.occupation_status,
                dependents: parseNumber(data.dependents as string),
                monthly_income: parseNumber(income),
                monthly_expense: parseNumber(expense),
                cash_on_hand: parseNumber(cashOnHand),
                invested_amount: parseNumber(investedAmount),
                current_debt: parseNumber(currentDebt),
                financial_goal: data.financial_goal,
                risk_tolerance: data.risk_tolerance || "medium",
            };

            await onComplete(payload);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "6px" };

    return (
        <form onSubmit={handleSubmit} className="card-utility" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header */}
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid var(--color-hairline)" }}>
                <h2 className="type-display-md" style={{ margin: "0 0 4px" }}>Financial Reality</h2>
                <p className="type-caption" style={{ color: "var(--color-ink-muted-48)" }}>Set once. Be brutally honest.</p>
            </div>

            {/* Name */}
            <div style={fieldStyle}>
                <label className="label-field">Name <span style={{ fontWeight: 400, color: "var(--color-ink-muted-48)" }}>(Optional)</span></label>
                <input type="text" name="name" defaultValue={initialData?.name || ""} className="input-field" style={{ fontSize: "15px" }} />
            </div>

            {/* Age, Dependents, Occupation */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "12px" }}>
                <div style={fieldStyle}>
                    <label className="label-field">Age</label>
                    <input type="number" name="age" required min="10" defaultValue={initialData?.age || ""} className="input-field" style={{ fontSize: "15px" }} />
                </div>
                <div style={fieldStyle}>
                    <label className="label-field">Dependents</label>
                    <input type="number" name="dependents" required min="0" defaultValue={initialData?.dependents !== undefined ? initialData.dependents : "0"} className="input-field" style={{ fontSize: "15px" }} title="Kids, parents, etc." />
                </div>
                <div style={fieldStyle}>
                    <label className="label-field">Occupation</label>
                    <select name="occupation_status" required defaultValue={initialData?.occupation_status || ""} className="select-field" style={{ fontSize: "15px" }}>
                        <option value="">Select…</option>
                        <option value="student">Student</option>
                        <option value="fresh_graduate">Fresh Graduate</option>
                        <option value="employee">Employee</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="business_owner">Business Owner</option>
                        <option value="self_employed">Self Employed</option>
                        <option value="retired">Retired</option>
                        <option value="unemployed">Unemployed</option>
                    </select>
                </div>
            </div>

            {/* Income */}
            <div style={fieldStyle}>
                <label className="label-field">Monthly Income (IDR)</label>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-muted-48)", fontSize: "15px", pointerEvents: "none" }}>Rp</span>
                    <input type="text" required value={income} onChange={e => handleCurrencyChange(e, setIncome)} className="input-field" style={{ paddingLeft: "40px", fontSize: "15px" }} />
                </div>
            </div>

            {/* Expense */}
            <div style={fieldStyle}>
                <label className="label-field">Monthly Expense (IDR)</label>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-muted-48)", fontSize: "15px", pointerEvents: "none" }}>Rp</span>
                    <input type="text" required value={expense} onChange={e => handleCurrencyChange(e, setExpense)} className="input-field" style={{ paddingLeft: "40px", fontSize: "15px" }} />
                </div>
            </div>

            {/* Assets */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={fieldStyle}>
                    <label className="label-field">Liquid Cash (IDR)</label>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-muted-48)", fontSize: "15px", pointerEvents: "none" }}>Rp</span>
                        <input type="text" value={cashOnHand} onChange={e => handleCurrencyChange(e, setCashOnHand)} className="input-field" style={{ paddingLeft: "40px", fontSize: "15px" }} />
                    </div>
                </div>
                <div style={fieldStyle}>
                    <label className="label-field">Invested Assets (IDR)</label>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-muted-48)", fontSize: "15px", pointerEvents: "none" }}>Rp</span>
                        <input type="text" value={investedAmount} onChange={e => handleCurrencyChange(e, setInvestedAmount)} className="input-field" style={{ paddingLeft: "40px", fontSize: "15px" }} />
                    </div>
                </div>
            </div>

            {/* Debt */}
            <div style={fieldStyle}>
                <label className="label-field">Current Debt / Paylater (IDR)</label>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-muted-48)", fontSize: "15px", pointerEvents: "none" }}>Rp</span>
                    <input type="text" required value={currentDebt} onChange={e => handleCurrencyChange(e, setCurrentDebt)} className="input-field" style={{ paddingLeft: "40px", fontSize: "15px", color: currentDebt && currentDebt !== "0" ? "#ff3b30" : "inherit" }} />
                </div>
                <p className="type-caption" style={{ color: "var(--color-ink-muted-48)", margin: "-2px 0 0" }}>Include credit cards, paylater, and personal loans.</p>
            </div>

            {/* Financial Goal */}
            <div style={fieldStyle}>
                <label className="label-field">Primary Financial Goal</label>
                <select name="financial_goal" required defaultValue={initialData?.financial_goal || ""} className="select-field" style={{ fontSize: "15px" }}>
                    <option value="">Select…</option>
                    <option value="emergency_fund">Build Emergency Fund</option>
                    <option value="debt_free">Become Debt Free</option>
                    <option value="saving_for_something">Save for a Big Purchase</option>
                    <option value="buy_house">Buy a House / Property</option>
                    <option value="wedding">Save for Wedding</option>
                    <option value="start_investing">Start Investing</option>
                    <option value="invest_retirement">Invest for Retirement</option>
                    <option value="financial_independence">Financial Independence (FIRE)</option>
                    <option value="no_specific_goal">No Specific Goal</option>
                </select>
            </div>

            {/* Risk Tolerance */}
            <div style={fieldStyle}>
                <label className="label-field">Risk Tolerance <span style={{ fontWeight: 400, color: "var(--color-ink-muted-48)" }}>(Optional)</span></label>
                <select name="risk_tolerance" defaultValue={initialData?.risk_tolerance || "medium"} className="select-field" style={{ fontSize: "15px" }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            {/* CTA row */}
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                {!initialData && (
                    <button type="button" onClick={() => {
                        setIncome(formatIDR(15000000)); setExpense(formatIDR(5000000)); setCashOnHand(formatIDR(4000000)); setInvestedAmount(formatIDR(16000000)); setCurrentDebt(formatIDR(5000000));
                        const form = document.querySelector('form') as HTMLFormElement;
                        if (form) {
                            (form.elements.namedItem('name') as HTMLInputElement).value = "Test User";
                            (form.elements.namedItem('age') as HTMLInputElement).value = "24";
                            (form.elements.namedItem('dependents') as HTMLInputElement).value = "0";
                            (form.elements.namedItem('occupation_status') as HTMLSelectElement).value = "employee";
                            (form.elements.namedItem('financial_goal') as HTMLSelectElement).value = "debt_free";
                        }
                    }} className="btn-ghost" style={{ flex: "0 0 auto", padding: "11px 16px", fontSize: "14px" }}>
                        Dummy Data
                    </button>
                )}
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: "center", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
                    {isSubmitting ? "Saving..." : (initialData ? "Update Profile" : "Lock Profile →")}
                </button>
            </div>
        </form>
    );
}