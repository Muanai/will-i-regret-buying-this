"use client";

import { useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import ProfileForm from "@/components/ProfileForm";
import ProductForm from "@/components/ProductForm";

export default function Home() {
  const [profileData, setProfileData] = useState<any>(null);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [productData, setProductData] = useState<any>(null);

  const handleProfileComplete = (data: any) => {
    setProfileData(data);
    setIsProfileLocked(true);
  };

  const handleProductSubmit = (data: any) => {
    setProductData(data);
    console.log("Ready for Backend API:", { profile: profileData, product: data });
  };

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
            {!isProfileLocked ? (
              <ProfileForm onComplete={handleProfileComplete} initialData={profileData} />
            ) : (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center text-sm">
                  <span className="text-green-800 font-medium">Financial reality verified.</span>
                  <button 
                    onClick={() => setIsProfileLocked(false)}
                    className="text-green-700 hover:text-green-900 underline font-semibold"
                  >
                    Edit Profile
                  </button>
                </div>

                {!productData ? (
                  <ProductForm onSubmitProduct={handleProductSubmit} />
                ) : (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 animate-pulse text-center font-medium">
                    Analysis in progress... (Awaiting FastAPI Backend)
                  </div>
                )}
              </>
            )}
          </div>
        </Show>
      </div>
    </main>
  );
}