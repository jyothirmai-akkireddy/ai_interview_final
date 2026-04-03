export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ---- SAFE BODY PARSE ----
    let body;

    try {
      const raw = await req.text();

      if (!raw) {
        return NextResponse.json(
          { error: "Empty request body" },
          { status: 400 }
        );
      }

      body = JSON.parse(raw);
    } catch (err) {
      console.error("Invalid JSON body received");
      return NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    const { role, text } = body;

    if (!role || !text) {
      return NextResponse.json(
        { error: "Missing role or text" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const prompt = `
You are a strict technical recruiter.

Target Role: ${role}

Resume Content:
${text}

Return ONLY valid JSON in this format:

{
  "resumeScore": number,
  "strengths": ["point1"],
  "missingSkills": ["skill1"]
}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You MUST return ONLY raw JSON. No markdown. No explanation.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);

      return NextResponse.json(
        { error: "Groq API failed", details: errText },
        { status: 500 }
      );
    }

    const data = await response.json();

    const content =
      data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error("Empty AI response");
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 500 }
      );
    }

    let parsed;

    try {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("AI returned invalid JSON:");
      console.error(content);

      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
          raw: content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Resume analyze FULL error:", error);

    return NextResponse.json(
      { error: "Resume analysis failed" },
      { status: 500 }
    );
  }
}