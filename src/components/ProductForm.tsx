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

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(formatIDR(e.target.value));
    };

    const handleScrape = async () => {
        if (!url) return;
        setIsScraping(true);
        setScrapeError("");

        try {
            const response = await fetch("http://localhost:8000/api/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error("Scrape blocked");
            }

            const data = await response.json();
            setProductName(data.product_name);
            setCategory(data.category);
        } catch (err) {
            setScrapeError("Could not auto-fetch product details. Please enter them manually.");
        } finally {
            setIsScraping(false);
            setIsFormRevealed(true);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const parseNumber = (val: string) => parseInt(val.replace(/\D/g, "") || "0", 10);

        const payload = {
            product_url: url,
            product_name: data.product_name,
            category: data.category,
            price: parseNumber(price),
            reason: data.reason || "",
            urgency: data.urgency || "",
        };

        onSubmitProduct(payload);
    };

    return (
        <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-sm">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">The Object of Desire</h2>
                <p className="text-sm text-gray-500 mt-1">Paste the link, let the AI read it, then face the price.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Product URL <span className="text-red-500">*</span>
                    </label>
                    <div className="flex mt-1 gap-2">
                        <input
                            type="url"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isScraping}
                            placeholder="https://shopee.co.id/..."
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none disabled:bg-gray-100 disabled:text-gray-500"
                        />
                        <button
                            type="button"
                            onClick={handleScrape}
                            disabled={isScraping || !url}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md font-medium hover:bg-black transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                            {isScraping ? "Scraping..." : "Auto-Fill"}
                        </button>
                    </div>
                    {scrapeError && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{scrapeError}</p>
                    )}
                </div>
            </div>

            {isFormRevealed && (
                <form onSubmit={handleSubmit} className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            required
                            defaultValue={productName}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            required
                            defaultValue={category}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none bg-white"
                        >
                            <option value="">Select...</option>
                            <option value="electronics">Electronics</option>
                            <option value="fashion">Fashion</option>
                            <option value="furniture">Furniture</option>
                            <option value="travel">Travel</option>
                            <option value="education">Education</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Price (IDR) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                            <input
                                type="text"
                                required
                                value={price}
                                onChange={handlePriceChange}
                                className="w-full rounded-md border-gray-300 shadow-sm py-2 pl-10 pr-3 border focus:ring-black focus:border-black outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Reason for Purchase <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            name="reason"
                            rows={3}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none resize-none"
                            placeholder="Why this? (Leave empty and the AI will judge based on category)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Urgency <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <select
                            name="urgency"
                            defaultValue=""
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none bg-white"
                        >
                            <option value="">Select...</option>
                            <option value="immediate_need">Immediate Need</option>
                            <option value="can_wait">Can Wait</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-4 bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Run Financial Analysis
                    </button>
                </form>
            )}
        </div>
    );
}