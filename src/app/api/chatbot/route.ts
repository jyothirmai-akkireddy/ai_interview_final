import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {

  try {

    const { message, history } = await req.json()

    const msg = message.toLowerCase()

    /* ---------- JOB SEARCH ---------- */

    if (
      msg.includes("job") ||
      msg.includes("opening") ||
      msg.includes("apply") ||
      msg.includes("hiring") ||
      msg.includes("latest")
    ) {

      const roleMatch =
        msg.match(
          /(data scientist|full stack|frontend|backend|python|java|react|node|mern|devops)/
        )

      const role = roleMatch ? roleMatch[0] : "software developer"

      const encodedRole = encodeURIComponent(role)

      const jobs = [

        {
          title: `${role} jobs on Indeed`,
          company: "Indeed",
          location: "Global",
          url: `https://www.indeed.com/jobs?q=${encodedRole}`
        },

        {
          title: `${role} jobs on LinkedIn`,
          company: "LinkedIn",
          location: "Global",
          url: `https://www.linkedin.com/jobs/search/?keywords=${encodedRole}`
        },

        {
          title: `${role} jobs on Naukri`,
          company: "Naukri",
          location: "India",
          url: `https://www.naukri.com/${encodedRole.replace("%20","-")}-jobs`
        },

        {
          title: `${role} jobs on Glassdoor`,
          company: "Glassdoor",
          location: "Global",
          url: `https://www.glassdoor.com/Job/${encodedRole}-jobs-SRCH_KO0,${role.length}.htm`
        }

      ]

      return NextResponse.json({
        reply: `Here are live platforms currently hiring for ${role}:`,
        jobs
      })

    }

    /* ---------- AI CHAT ---------- */

    const messages = [
      {
        role: "system",
        content:
          "You are a concise AI career assistant helping with coding interviews and job search. Keep answers short unless explanation is requested."
      },
      ...(history || []),
      {
        role: "user",
        content: message
      }
    ]

    const ai = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.4,
        }),
      }
    )

    const data = await ai.json()

    const reply =
      data?.choices?.[0]?.message?.content ||
      "I couldn't generate a response."

    return NextResponse.json({
      reply,
      jobs: null
    })

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { reply: "Something went wrong.", jobs: null },
      { status: 500 }
    )

  }

}