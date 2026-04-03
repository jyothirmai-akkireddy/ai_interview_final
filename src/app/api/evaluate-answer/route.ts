import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Missing question or answer" },
        { status: 400 }
      );
    }

    const prompt = `
You are a strict technical interviewer.

Evaluate the candidate's answer.

Question:
${question}

Candidate Answer:
${answer}

Evaluation Rules:

1. If this is a coding question:
   - Check logical correctness.
   - Check if edge cases are handled.
   - Check if algorithm is valid.
   - Penalize incomplete code.
   - Penalize syntax that makes no sense.
   - If code is wrong → score below 50.
   - If answer is vague explanation without real solution → score below 40.

2. If this is a theory question:
   - Check conceptual correctness.
   - Penalize vague or generic answers.
   - Reward depth and clarity.

3. If answer is very short (<15 words) → score below 40.

4. Do NOT be overly generous.

Return ONLY valid JSON in this exact format:

{
  "score": number (0-100),
  "feedback": "clear explanation of strengths and weaknesses",
  "isWeak": boolean
}

Scoring Guide:
90-100 → Excellent and complete
70-89 → Good but minor gaps
50-69 → Basic but missing depth
30-49 → Weak understanding
0-29 → Incorrect or irrelevant
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
                "You are a strict and fair technical interviewer.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // IMPORTANT: lower randomness
        }),
      }
    );

    const data = await response.json();

    const content =
      data.choices?.[0]?.message?.content?.trim();

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}