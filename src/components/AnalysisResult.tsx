"use client";

interface AnalysisData {
    suggested_risk_tier: string;
    purchase_summary: string;
    financial_impact_reason: string;
    behavioral_insight: string;
    recommendation_action: string;
    recommendation_alternative: string;
}

export default function AnalysisResult({ data, onReset }: { data: AnalysisData, onReset: () => void }) {
    const getRiskColor = (tier: string) => {
        switch (tier.toLowerCase()) {
            case "low": return "bg-green-100 border-green-500 text-green-900";
            case "medium": return "bg-yellow-100 border-yellow-500 text-yellow-900";
            case "high": return "bg-orange-100 border-orange-500 text-orange-900";
            case "catastrophic": return "bg-red-100 border-red-500 text-red-900";
            default: return "bg-gray-100 border-gray-500 text-gray-900";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={`p-6 border-l-4 rounded-r-xl shadow-sm ${getRiskColor(data.suggested_risk_tier)}`}>
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold uppercase tracking-widest">{data.suggested_risk_tier} RISK</h2>
                    <span className="px-4 py-1 bg-black text-white text-sm font-bold rounded-full uppercase tracking-wider">
                        {data.recommendation_action}
                    </span>
                </div>
                <p className="mt-4 text-lg font-medium italic">"{data.purchase_summary}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Financial Impact</h3>
                    <p className="text-gray-800 leading-relaxed">{data.financial_impact_reason}</p>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Behavioral Insight</h3>
                    <p className="text-gray-800 leading-relaxed">{data.behavioral_insight}</p>
                </div>
            </div>

            <div className="p-6 bg-gray-900 text-white rounded-xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">The Pragmatic Alternative</h3>
                <p className="text-gray-100 leading-relaxed">{data.recommendation_alternative}</p>
            </div>

            <button
                onClick={onReset}
                className="w-full py-4 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
            >
                Analyze Another Delusion
            </button>
        </div>
    );
}