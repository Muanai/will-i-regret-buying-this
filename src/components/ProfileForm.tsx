"use client";

import { useState } from "react";

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

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-sm">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Financial Reality Check</h2>
                <p className="text-sm text-gray-500 mt-1">Set once. Be brutally honest.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={initialData?.name || ""}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Age <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="age"
                            required
                            min="10"
                            defaultValue={initialData?.age || ""}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Occupation <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="occupation_status"
                            required
                            defaultValue={initialData?.occupation_status || ""}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none bg-white"
                        >
                            <option value="">Select...</option>
                            <option value="student">Student</option>
                            <option value="fresh_graduate">Fresh Graduate</option>
                            <option value="employee">Employee</option>
                            <option value="freelancer">Freelancer</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Monthly Income (IDR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                        <input
                            type="text"
                            required
                            value={income}
                            onChange={(e) => handleCurrencyChange(e, setIncome)}
                            className="w-full rounded-md border-gray-300 shadow-sm py-2 pl-10 pr-3 border focus:ring-black focus:border-black outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Monthly Expense (IDR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                        <input
                            type="text"
                            required
                            value={expense}
                            onChange={(e) => handleCurrencyChange(e, setExpense)}
                            className="w-full rounded-md border-gray-300 shadow-sm py-2 pl-10 pr-3 border focus:ring-black focus:border-black outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Current Savings (IDR)
                    </label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                        <input
                            type="text"
                            value={savings}
                            onChange={(e) => handleCurrencyChange(e, setSavings)}
                            className="w-full rounded-md border-gray-300 shadow-sm py-2 pl-10 pr-3 border focus:ring-black focus:border-black outline-none"
                        />
                    </div>
                    {!savings && (
                        <p className="mt-2 text-xs text-amber-600 font-medium">
                            Defaults to 0. Analysis will be less accurate.
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Primary Financial Goal <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="financial_goal"
                        required
                        defaultValue={initialData?.financial_goal || ""}
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
                        defaultValue={initialData?.risk_tolerance || "medium"}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-black focus:border-black outline-none bg-white"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-4">
                {!initialData && (
                    <button
                        type="button"
                        onClick={() => {
                            setIncome(formatIDR(15000000));
                            setExpense(formatIDR(5000000));
                            setSavings(formatIDR(20000000));
                            const form = document.querySelector('form') as HTMLFormElement;
                            if (form) {
                                (form.elements.namedItem('name') as HTMLInputElement).value = "Test User";
                                (form.elements.namedItem('age') as HTMLInputElement).value = "20";
                                (form.elements.namedItem('occupation_status') as HTMLSelectElement).value = "student";
                                (form.elements.namedItem('financial_goal') as HTMLSelectElement).value = "start_investing";
                            }
                        }}
                        className="w-1/3 bg-gray-200 text-gray-700 p-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Inject Dummy
                    </button>
                )}
                <button
                    type="submit"
                    className={`${initialData ? 'w-full' : 'w-2/3'} bg-black text-white p-3 rounded-md font-semibold hover:bg-gray-800 transition-colors`}
                >
                    Lock Profile
                </button>
            </div>
        </form>
    );
}