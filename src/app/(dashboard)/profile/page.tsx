"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProfilePage() {

  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
const [formData, setFormData] = useState({
  age: "",
  phone: "",
  role: ""
});

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        setUserData({
          fullName: "Guest",
          email: "Not logged in",
          age: "-",
          phone: "-",
          role: "-"
        });
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        setUserData({
          fullName: user.displayName,
          email: user.email,
          age: "Not set",
          phone: "Not set",
          role: "Not set"
        });
      }

    });

    return () => unsubscribe();

  }, []);

  if (userData === null)
    return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-3 gap-6">

        {/* PROFILE DETAILS */}
        
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg">

          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo.png"
              className="w-24 h-24 rounded-full mb-3"
            />

            <h2 className="text-xl font-semibold">
              {userData.fullName}
            </h2>

            <p className="text-gray-400">{userData.email}</p>
          </div>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span>Age</span>
              {userData.age === "Not set" ? (
  <button
    className="text-blue-400 hover:underline"
    onClick={() => setEditing(true)}
  >
    Set Now
  </button>
) : (
  <span>{userData.age}</span>
)}
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span>Phone</span>
             {userData.age === "Not set" ? (
  <button
    className="text-blue-400 hover:underline"
    onClick={() => setEditing(true)}
  >
    Set Now
  </button>
) : (
  <span>{userData.phone}</span>
)}
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span>Role</span>
             {userData.age === "Not set" ? (
  <button
    className="text-blue-400 hover:underline"
    onClick={() => setEditing(true)}
  >
    Set Now
  </button>
) : (
  <span>{userData.role}</span>
)}
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span>Status</span>
              <span className="text-green-400">Active</span>
            </div>

          </div>

        </div>

        {/* PRACTICE TRACKER */}
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg col-span-2">

          <h2 className="text-xl font-semibold mb-4">
            Practice Tracker
          </h2>

         <div className="grid grid-cols-12 gap-1">

            {Array.from({ length: 84 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-gray-700 rounded-sm"
              />
            ))}

          </div>

          <p className="text-gray-400 text-sm mt-3">
            Green boxes will appear when you practice interviews.
          </p>

        </div>

        {/* PERFORMANCE STATS */}
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg col-span-3">

          <h2 className="text-xl font-semibold mb-4">
            Performance
          </h2>

          <div className="grid grid-cols-4 gap-4 text-center">

            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">
                Interview Score
              </p>
              <p className="text-lg font-semibold text-green-400">
                82%
              </p>
            </div>

            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">
                Resume Strength
              </p>
              <p className="text-lg font-semibold text-blue-400">
                Strong
              </p>
            </div>

            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">
                Strength
              </p>
              <p className="text-lg font-semibold">
                Problem Solving
              </p>
            </div>

            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">
                Weakness
              </p>
              <p className="text-lg font-semibold text-red-400">
                Communication
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}