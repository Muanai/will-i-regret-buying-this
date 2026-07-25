"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import ProductForm from "@/components/ProductForm";

export default function Home() {
  const [profileData, setProfileData] = useState(null);
  const [productData, setProductData] = useState(null);

  const handleProfileComplete = (data: any) => {
    setProfileData(data);
  };

  const handleProductSubmit = (data: any) => {
    setProductData(data);
    console.log("Ready to send to API:", { profile: profileData, product: data });
  };

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
          {!profileData ? (
            <ProfileForm onComplete={handleProfileComplete} />
          ) : (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center text-sm">
                <span className="text-green-800 font-medium">Profile locked and loaded.</span>
                <button
                  onClick={() => setProfileData(null)}
                  className="text-green-700 hover:text-green-900 underline font-semibold"
                >
                  Edit Profile
                </button>
              </div>

              {!productData ? (
                <ProductForm onSubmitProduct={handleProductSubmit} />
              ) : (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 animate-pulse text-center font-medium">
                  Analysis in progress... (Backend integration pending)
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}