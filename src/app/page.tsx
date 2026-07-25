import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex justify-between items-center py-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Will I Regret Buying This?
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">
              AI Purchase Decision Copilot
            </p>
          </div>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </header>

        <Show when="signed-out">
          <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Stop impulse buying. Check your finances first.
            </h2>
            <SignInButton mode="modal">
              <button className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors">
                Sign In to Start
              </button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
              <p className="text-gray-600 font-medium">
                You are logged in. The Profile and Product forms will live here.
              </p>
            </div>
          </div>
        </Show>
      </div>
    </main>
  );
}