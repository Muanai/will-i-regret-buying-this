"use client";

import { useState } from "react";

export default function ProductForm({ onSubmitProduct }: { onSubmitProduct: (data: any) => void }) {
    const [url, setUrl] = useState("");
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeError, setScrapeError] = useState("");
    const [isFormRevealed, setIsFormRevealed] = useState(false);
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");

    const formatIDR = (value: string) => {
        const raw = value.replace(/\D/g, "");
        if (!raw) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(raw, 10));
    };
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setPrice(formatIDR(e.target.value));

    const handleScrape = async () => {
        if (!url) return;
        setIsScraping(true);
        setScrapeError("");
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${API_URL}/api/scrape`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }),
            });
            if (!response.ok) throw new Error("Scrape blocked");
            const data = await response.json();
            setProductName(data.product_name);
            setCategory(data.category);
        } catch { setScrapeError("Could not auto-fetch. Please enter details manually."); }
        finally { setIsScraping(false); setIsFormRevealed(true); }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const parseNumber = (val: string) => parseInt(val.replace(/\D/g, "") || "0", 10);
        onSubmitProduct({ 
            product_url: url, 
            product_name: data.product_name, 
            category: data.category, 
            price: parseNumber(price), 
            reason: data.reason || "", 
            urgency: data.urgency || "",
            usage_frequency: data.usage_frequency || "",
            purchase_motivation: data.purchase_motivation || ""
        });
    };

    const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "8px" };
    const RequiredAsterisk = () => <span style={{ color: "#ff3b30", marginLeft: "2px" }}>*</span>;

    return (
        <div className="card-utility" style={{ display: "flex", flexDirection: "column", gap: "28px", border: "none", padding: 0 }}>
            {/* Editorial Header */}
            <div style={{ paddingBottom: "16px" }}>
                <span className="type-caption-strong" style={{ display: "block", textTransform: "uppercase", letterSpacing: "1.2px", fontSize: "11px", color: "var(--color-primary)", marginBottom: "4px" }}>
                    New Interrogation
                </span>
                <h2 className="type-display-md" style={{ margin: "0 0 4px", fontSize: "32px", letterSpacing: "-0.5px" }}>
                    The Object of Desire.
                </h2>
                <p className="type-caption" style={{ fontSize: "14px", color: "var(--color-ink-muted-80)", margin: 0 }}>
                    Paste the link, let the AI read it, then face the price.
                </p>
            </div>

            {/* URL + Scrape */}
            <div style={{ ...fieldStyle, background: "var(--color-canvas-parchment)", padding: "20px", borderRadius: "16px", border: "1px solid var(--color-divider-soft)", gap: "12px" }}>
                <label className="label-field" style={{ margin: 0 }}>Product URL <span style={{ fontWeight: 400, color: "var(--color-ink-muted-48)" }}>(Optional)</span></label>
                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && url && !isScraping) {
                                e.preventDefault();
                                handleScrape();
                            }
                        }}
                        disabled={isScraping}
                        placeholder="https://www.gramedia.com/..."
                        className="input-field"
                        style={{ flex: 1, fontSize: "15px" }}
                    />
                    <button type="button" onClick={handleScrape} disabled={isScraping || !url} className="btn-dark-utility" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                        {isScraping ? "Reading…" : "Auto-Fill"}
                    </button>
                </div>
                {scrapeError && <p className="type-caption" style={{ color: "#880e4f" }}>{scrapeError}</p>}
                {!isFormRevealed && (
                    <button type="button" onClick={() => setIsFormRevealed(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                        <span className="type-caption" style={{ color: "var(--color-primary)" }}>Or enter details manually →</span>
                    </button>
                )}
            </div>

            {isFormRevealed && (
                <form onSubmit={handleSubmit} className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={fieldStyle}>
                        <label className="label-field">Product Name<RequiredAsterisk /></label>
                        <input type="text" name="product_name" required value={productName || ""} onChange={e => setProductName(e.target.value)} className="input-field" style={{ fontSize: "15px" }} />
                    </div>

                    <div style={fieldStyle}>
                        <label className="label-field">Category<RequiredAsterisk /></label>
                        <select name="category" required value={category || ""} onChange={e => setCategory(e.target.value)} className="select-field" style={{ fontSize: "15px" }}>
                            <option value="">Select…</option>

                            <option value="electronics">Electronics & Gadgets</option>
                            <option value="fashion">Fashion & Apparel</option>
                            <option value="furniture">Furniture</option>
                            <option value="vehicle">Vehicle & Parts</option>
                            <option value="hobby">Hobby & Collectibles</option>
                            <option value="entertainment">Entertainment & Gaming</option>
                            <option value="health_beauty">Health & Beauty</option>
                            <option value="home">Home Appliances</option>
                            <option value="travel">Travel & Experience</option>
                            <option value="education">Education</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div style={fieldStyle}>
                        <label className="label-field">Price (IDR)<RequiredAsterisk /></label>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-muted-48)", fontSize: "15px", pointerEvents: "none" }}>Rp</span>
                            <input type="text" required value={price} onChange={handlePriceChange} className="input-field" style={{ paddingLeft: "40px", fontSize: "15px" }} />
                        </div>
                    </div>


                    <div style={fieldStyle}>
                            <label className="label-field">Motivation<RequiredAsterisk /></label>
                            <select name="purchase_motivation" required defaultValue="" className="select-field" style={{ fontSize: "15px" }}>
                                <option value="">Select…</option>
                                <option value="replacement">Replacing Broken Item</option>
                                <option value="upgrade">Upgrading Existing Item</option>
                                <option value="productivity">Work / Productivity</option>
                                <option value="hobby">Pure Hobby / Fun</option>
                                <option value="flex">Status / Flex</option>
                                <option value="impulse">Impulse / Boredom</option>
                            </select>
                        </div>

                    <div style={fieldStyle}>
                            <label className="label-field">Usage Frequency<RequiredAsterisk /></label>
                            <select name="usage_frequency" required defaultValue="" className="select-field" style={{ fontSize: "15px" }}>
                                <option value="">Select…</option>
                                <option value="daily">Every Day</option>
                                <option value="weekly">Every Week</option>
                                <option value="monthly">Every Month</option>
                                <option value="rarely">Rarely / Special Occasion</option>
                                <option value="one_time">One-Time Use</option>
                            </select>
                        </div>

                    <div style={fieldStyle}>
                        <label className="label-field">Urgency<RequiredAsterisk /></label>
                        <select name="urgency" required defaultValue="" className="select-field" style={{ fontSize: "15px" }}>
                            <option value="">Select…</option>
                            <option value="immediate_need">Immediate Need</option>
                            <option value="can_wait_weeks">Can Wait a Few Weeks</option>
                            <option value="can_wait_months">Can Wait a Few Months</option>
                        </select>
                    </div>

                    <div style={fieldStyle}>
                        <label className="label-field">Why do you want this? <span style={{ fontWeight: 400, color: "var(--color-ink-muted-48)" }}>(Optional)</span></label>
                        <textarea name="reason" rows={3} className="input-field" style={{ resize: "none", fontSize: "15px" }} placeholder="Be honest. The AI knows when you're lying." />
                    </div>

                    <div style={{ ...fieldStyle, marginTop: "8px" }}>
                        <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 28px", fontSize: "16px" }}>
                            Submit for Judgment
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}