import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { role, transcript, cameraMetrics } = await req.json();

    if (!role || !transcript) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const cameraSection = cameraMetrics
      ? `
Camera & Behavior Metrics:
- Eye Contact Percentage: ${cameraMetrics.eyeContactPercentage}%
- Head Turn Count: ${cameraMetrics.headTurnCount}
- Low Light Frames: ${cameraMetrics.lowLightCount}

Interpretation Rules:
- Eye contact below 60% = weak presence.
- Frequent head turns = distraction.
- High low-light count = poor environment setup.
`
      : "No camera metrics available.";

const prompt = `
You are an expert AI interviewer evaluating a candidate.

Analyze the interview based on two factors:

1️⃣ Answer Quality (technical depth, clarity, structure)
2️⃣ Camera Behavior (confidence, eye contact, posture)

Role: ${role}

Interview Transcript:
${transcript}

Camera Metrics:
Eye Contact Percentage: ${cameraMetrics?.eyeContactPercentage}
Head Turns: ${cameraMetrics?.headTurnCount}
Low Light Frames: ${cameraMetrics?.lowLightCount}

Evaluation rules:

Eye Contact
- If eye contact > 75 → strength
- If eye contact < 60 → weakness

Head Movement
- If headTurnCount > 15 → weakness (candidate moved head excessively)
- If headTurnCount < 5 → strength (stable posture)

Lighting
- If lowLightCount > 10 → weakness (poor lighting)

Answer Quality
- If answers are short or unclear → weakness
- If answers contain clear explanation or logic → strength

You MUST generate both:

Strengths (Pros)
Weak Areas (Cons)

Even if performance is weak, at least one strength must be listed.

Return STRICT JSON:

{
  "overallRating": "Excellent | Good | Average | Weak",
  "confidenceScore": number between 20 and 95,
  "strengths": [
    "list of positive observations"
  ],
  "weakAreas": [
    "list of negative observations"
  ],
  "improvementPlan": [
    "specific improvement suggestions"
  ],
  "eyeContactPercentage": number,
  "distractionFeedback": "comment about head movement",
  "environmentFeedback": "comment about lighting"
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
                "You are a strict and professional interview performance evaluator. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();

    const content =
      data.choices?.[0]?.message?.content?.trim();

    console.log("RAW SUMMARY:", content);

    let parsed;

    try {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error(
        "Summary JSON parse error:",
        content
      );

      return NextResponse.json(
        { error: "Invalid summary format" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Summary route error:", error);

    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}