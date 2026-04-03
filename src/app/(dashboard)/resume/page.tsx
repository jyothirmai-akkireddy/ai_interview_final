"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

declare global {
interface Window {
pdfjsLib: any;
}
}

export default function ResumePage() {
const [file, setFile] = useState<File | null>(null);
const [role, setRole] = useState("");
const [result, setResult] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [pdfReady, setPdfReady] = useState(false);

/* ---------------- LOAD PDF.JS ---------------- */

useEffect(() => {
const script = document.createElement("script");
script.src =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


script.onload = () => {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  setPdfReady(true);
};

document.body.appendChild(script);


}, []);

/* ---------------- PDF TEXT EXTRACTION ---------------- */

const extractTextFromPDF = async (file: File) => {
if (!window.pdfjsLib) throw new Error("PDF.js not loaded");


const arrayBuffer = await file.arrayBuffer();
const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

let text = "";

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();

  const pageText = content.items.map((item: any) => item.str).join(" ");

  text += pageText + "\n";
}

text = text
  .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
  .replace(/\s+/g, " ")
  .trim();

if (text.length > 15000) text = text.slice(0, 15000);

return text;


};

/* ---------------- ANALYZE ---------------- */

const analyze = async () => {
if (!file || !role || !pdfReady) return;


setLoading(true);

try {
  const text = await extractTextFromPDF(file);

  const res = await fetch("/api/analyze-resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, text }),
  });

  const data = await res.json();
  setResult(data);
} catch (err) {
  console.error(err);
}

setLoading(false);


};

/* ---------------- UI ---------------- */

return ( <main className="px-6 py-10 min-h-screen text-white">

  <Card className="max-w-3xl mx-auto space-y-8 bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">

    <h1 className="text-2xl font-bold tracking-tight">
      Resume Analyzer
    </h1>

    {/* ROLE INPUT */}

    <input
      type="text"
      placeholder="Target Role (e.g. Frontend Developer)"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
    />

    {/* FILE INPUT */}

    <input
      type="file"
      accept=".pdf"
      onChange={(e) =>
        setFile(e.target.files ? e.target.files[0] : null)
      }
      className="text-sm text-gray-300"
    />

    {/* BUTTON */}

    <Button onClick={analyze}>
      {loading ? "Analyzing Resume..." : "Analyze Resume"}
    </Button>

    {/* RESULTS */}

    {result && (
      <div className="space-y-8 pt-6 border-t border-white/10">

        {/* SCORE */}

        <div className="space-y-2">

          <div className="flex justify-between text-sm">
            <span>Resume Score</span>
            <span>{result.resumeScore}/100</span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2">

            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${result.resumeScore}%` }}
            />

          </div>

        </div>

        {/* STRENGTHS */}

        <div>

          <p className="font-semibold text-green-400 mb-2">
            Strengths
          </p>

          <ul className="list-disc ml-5 text-sm space-y-2 text-gray-300">

            {result.strengths?.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}

          </ul>

        </div>

        {/* MISSING SKILLS */}

        <div>

          <p className="font-semibold text-red-400 mb-2">
            Missing Skills
          </p>

          <ul className="list-disc ml-5 text-sm space-y-2 text-gray-300">

            {result.missingSkills?.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}

          </ul>

        </div>

      </div>
    )}

  </Card>

</main>

);
}
