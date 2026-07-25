"use client";

import { useState } from "react";

export default function ProfileForm({ onComplete }: { onComplete: (data: any) => void }) {
    const [savings, setSavings] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (!data.current_savings) {
            data.current_savings = "0";
        }

        onComplete(data);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Financial Profile</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Age <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="age"
                        required
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Occupation Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="occupation_status"
                        required
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none bg-white"
                    >
                        <option value="">Select...</option>
                        <option value="student">Student</option>
                        <option value="fresh_graduate">Fresh Graduate</option>
                        <option value="employee">Employee</option>
                        <option value="freelancer">Freelancer</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Monthly Income <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="monthly_income"
                        required
                        min="0"
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Monthly Expense <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="monthly_expense"
                        required
                        min="0"
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Current Savings <span className="text-gray-400 font-normal">(Defaults to 0)</span>
                    </label>
                    <input
                        type="number"
                        name="current_savings"
                        min="0"
                        value={savings}
                        onChange={(e) => setSavings(e.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                    />
                    {savings === "" && (
                        <p className="mt-2 text-sm text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100">
                            Result is less accurate without savings data.
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Financial Goal <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="financial_goal"
                        required
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none bg-white"
                    >
                        <option value="">Select...</option>
                        <option value="emergency_fund">Emergency Fund</option>
                        <option value="debt_free">Debt Free</option>
                        <option value="saving_for_something">Saving for Something</option>
                        <option value="start_investing">Start Investing</option>
                        <option value="no_specific_goal">No Specific Goal</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Risk Tolerance <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                        name="risk_tolerance"
                        defaultValue="medium"
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none bg-white"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-gray-900 text-white p-3 rounded-md font-semibold hover:bg-black transition-colors"
            >
                Lock Profile
            </button>
        </form>
    );
}