import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateQuestion(
  difficulty: "easy" | "medium" | "hard",
  tone: "friendly" | "strict"
) {
  const prompt = `
You are an AI interview trainer.

Difficulty: ${difficulty}
Tone: ${tone}

Ask one realistic interview question.
Keep it concise.
Do not add explanations.
Only output the question.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim();
}

/* ------------------ EVALUATION ENGINE ------------------ */

export async function evaluateAnswer(
  question: string,
  answer: string
) {
  const prompt = `
You are an AI interview evaluator for college students.

Be fair and constructive.
Do NOT be overly harsh.
Reward partial correctness.
Encourage improvement.

Question:
${question}

Answer:
${answer}

Return ONLY valid JSON in this exact format:

{
  "score": number (0-100),
  "feedback": "short constructive feedback",
  "isWeak": boolean
}

Scoring guidelines:
- 0–40: Very poor / irrelevant
- 40–60: Basic understanding
- 60–80: Good answer
- 80–100: Excellent answer

Mark isWeak = true only if:
- The answer is extremely short
- Completely incorrect
- Off-topic
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content?.trim();

  try {
    return JSON.parse(raw!);
  } catch {
    return {
      score: 0,
      feedback: "Failed to evaluate answer properly.",
      isWeak: true,
    };
  }
}