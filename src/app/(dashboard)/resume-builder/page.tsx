"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ResumeBuilderPage() {

  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    role: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
  });

  const [generated, setGenerated] = useState("");

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const generateResume = async () => {

    const res = await fetch("/api/generate-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    setGenerated(result.resume);
  };

  const inputClass =
    "w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500";

  const textareaClass =
    "w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 min-h-[110px]";

  return (
    <main className="px-6 py-10 min-h-screen text-white">

      <Card className="max-w-5xl mx-auto space-y-8 bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">

        <h1 className="text-2xl font-bold tracking-tight">
          AI Resume Builder
        </h1>

        {/* PERSONAL INFO */}

        <input
          placeholder="Full Name"
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={inputClass}
        />

        <input
          placeholder="Email"
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={inputClass}
        />

        <input
          placeholder="Phone"
          value={data.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className={inputClass}
        />

        <input
          placeholder="Location"
          value={data.location}
          onChange={(e) => handleChange("location", e.target.value)}
          className={inputClass}
        />

        <input
          placeholder="LinkedIn URL"
          value={data.linkedin}
          onChange={(e) => handleChange("linkedin", e.target.value)}
          className={inputClass}
        />

        <input
          placeholder="GitHub URL"
          value={data.github}
          onChange={(e) => handleChange("github", e.target.value)}
          className={inputClass}
        />

        {/* ROLE */}

        <input
          placeholder="Target Role (e.g Full Stack Developer)"
          value={data.role}
          onChange={(e) => handleChange("role", e.target.value)}
          className={inputClass}
        />

        {/* SKILLS */}

        <textarea
          placeholder="Skills (React, Node.js, MongoDB, AWS...)"
          value={data.skills}
          onChange={(e) => handleChange("skills", e.target.value)}
          className={textareaClass}
        />

        {/* EXPERIENCE */}

        <textarea
          placeholder="Work Experience"
          value={data.experience}
          onChange={(e) => handleChange("experience", e.target.value)}
          className={textareaClass}
        />

        {/* PROJECTS */}

        <textarea
          placeholder="Projects"
          value={data.projects}
          onChange={(e) => handleChange("projects", e.target.value)}
          className={textareaClass}
        />

        {/* EDUCATION */}

        <textarea
          placeholder="Education"
          value={data.education}
          onChange={(e) => handleChange("education", e.target.value)}
          className={textareaClass}
        />

        <Button onClick={generateResume}>
          Generate ATS Resume
        </Button>

        {/* GENERATED LATEX */}

        {generated && (
          <div className="bg-black/70 p-6 rounded-xl border border-white/10 overflow-x-auto">

            <p className="text-sm text-gray-400 mb-3">
              Copy this LaTeX code and paste it in https://overleaf.com
            </p>

            <pre className="text-green-400 text-sm whitespace-pre-wrap">
              {generated}
            </pre>

          </div>
        )}

      </Card>

    </main>
  );
}