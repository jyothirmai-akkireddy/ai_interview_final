import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { difficulty, tone, role } = await req.json();

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a professional interviewer.

Conduct a realistic technical interview for the role of: ${role}

Difficulty level: ${difficulty}
Interviewer tone: ${tone}

Rules:
- Ask ONE question only.
- Do NOT include explanations.
- Do NOT include answers.
- Do NOT include numbering.
- Make it sound natural.
- Keep it concise but realistic.
- If technical role → ask role-specific technical questions.
- If HR/behavioral role → ask behavioral questions.
- Increase depth based on difficulty:
  easy → fundamentals
  medium → applied concepts
  hard → deep edge cases / optimization / system design

Return ONLY the question text.
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
                "You are a strict but professional technical interviewer.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    const question =
      data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ question });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}