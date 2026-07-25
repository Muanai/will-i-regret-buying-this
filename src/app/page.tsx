export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center py-8 border-b border-gray-200">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Will I Regret Buying This?
          </h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">
            AI Purchase Decision Copilot
          </p>
        </header>

        <div id="forms-container" className="space-y-6">
        </div>
      </div>
    </main>
  );
}