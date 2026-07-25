"use client";

import { useState } from "react";

export default function ProductForm({ onSubmitProduct }: { onSubmitProduct: (data: any) => void }) {
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const reasonText = (data.reason as string).trim();
        const wordCount = reasonText === "" ? 0 : reasonText.split(/\s+/).length;

        if (wordCount < 5) {
            setError("Please describe your reason in a bit more detail.");
            return;
        }

        onSubmitProduct(data);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Product Details</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="product_name"
                        required
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
                        Price <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="price"
                        required
                        min="1"
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Reason for Purchase <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="reason"
                        required
                        rows={3}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none resize-none"
                        placeholder="Why do you want to buy this? (minimum 5 words)"
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Product URL <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="url"
                        name="product_url"
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
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
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
                Analyze Purchase
            </button>
        </form>
    );
}