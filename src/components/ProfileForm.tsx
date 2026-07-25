"use client";

import { useState, useEffect } from "react";

export default function ProfileForm({
    onComplete,
    initialData
}: {
    onComplete: (data: any) => void;
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
    const [savings, setSavings] = useState(initialData?.current_savings !== undefined ? formatIDR(initialData.current_savings) : "");

    useEffect(() => {
        if (initialData) {
            setIncome(formatIDR(initialData.monthly_income));
            setExpense(formatIDR(initialData.monthly_expense));
            setSavings(formatIDR(initialData.current_savings));
            // Uncontrolled inputs update
            const form = document.querySelector('form') as HTMLFormElement;
            if (form) {
                const ageInput = form.elements.namedItem('age') as HTMLInputElement;
                if (ageInput) ageInput.value = initialData.age || "";
                
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const parseNumber = (val: string) => parseInt(val.replace(/\D/g, "") || "0", 10);

        const payload = {
            name: data.name,
            age: parseInt(data.age as string, 10),
            occupation_status: data.occupation_status,
            monthly_income: parseNumber(income),
            monthly_expense: parseNumber(expense),
            current_savings: parseNumber(savings),
            financial_goal: data.financial_goal,
            risk_tolerance: data.risk_tolerance || "medium",
        };

        onComplete(payload);
    };

    const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "6px" };

    return (
        <form onSubmit={handleSubmit} className="card-utility" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header */}
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid var(--color-hairline)" }}>
                <p className="type-caption" style={{ color: "var(--color-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Step 1</p>
                <h2 className="type-display-md" style={{ margin: "0 0 4px" }}>Financial Reality</h2>
                <p className="type-caption" style={{ color: "var(--color-ink-muted-48)" }}>Set once. Be brutally honest.</p>
            </div>

            {/* Name */}
            <div style={fieldStyle}>
                <label className="label-field">Name <span style={{ fontWeight: 400, color: "var(--color-ink-muted-48)" }}>(Optional)</span></label>
                <input type="text" name="name" defaultValue={initialData?.name || ""} className="input-field" style={{ fontSize: "15px" }} />
            </div>

            {/* Age + Occupation */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={fieldStyle}>
                    <label className="label-field">Age</label>
                    <input type="number" name="age" required min="10" defaultValue={initialData?.age || ""} className="input-field" style={{ fontSize: "15px" }} />
                </div>
                <div style={fieldStyle}>
                    <label className="label-field">Occupation</label>
                    <select name="occupation_status" required defaultValue={initialData?.occupation_status || ""} className="select-field" style={{ fontSize: "15px" }}>
                        <option value="">Select…</option>
                        <option value="student">Student</option>
                        <option value="fresh_graduate">Fresh Graduate</option>
                        <option value="employee">Employee</option>
                        <option value="freelancer">Freelancer</option>
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

            {/* Savings */}
            <div style={fieldStyle}>
                <label className="label-field">Current Savings (IDR)</label>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-muted-48)", fontSize: "15px", pointerEvents: "none" }}>Rp</span>
                    <input type="text" value={savings} onChange={e => handleCurrencyChange(e, setSavings)} className="input-field" style={{ paddingLeft: "40px", fontSize: "15px" }} />
                </div>
                {!savings && <p className="type-caption" style={{ color: "#e65100" }}>Defaults to 0. Analysis will be less accurate.</p>}
            </div>

            {/* Financial Goal */}
            <div style={fieldStyle}>
                <label className="label-field">Primary Financial Goal</label>
                <select name="financial_goal" required defaultValue={initialData?.financial_goal || ""} className="select-field" style={{ fontSize: "15px" }}>
                    <option value="">Select…</option>
                    <option value="emergency_fund">Emergency Fund</option>
                    <option value="debt_free">Debt Free</option>
                    <option value="saving_for_something">Saving for Something</option>
                    <option value="start_investing">Start Investing</option>
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
                        setIncome(formatIDR(15000000)); setExpense(formatIDR(5000000)); setSavings(formatIDR(20000000));
                        const form = document.querySelector('form') as HTMLFormElement;
                        if (form) {
                            (form.elements.namedItem('name') as HTMLInputElement).value = "Test User";
                            (form.elements.namedItem('age') as HTMLInputElement).value = "20";
                            (form.elements.namedItem('occupation_status') as HTMLSelectElement).value = "student";
                            (form.elements.namedItem('financial_goal') as HTMLSelectElement).value = "start_investing";
                        }
                    }} className="btn-ghost" style={{ flex: "0 0 auto", padding: "11px 16px", fontSize: "14px" }}>
                        Dummy Data
                    </button>
                )}
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                    {initialData ? "Update Profile" : "Lock Profile →"}
                </button>
            </div>
        </form>
    );
}