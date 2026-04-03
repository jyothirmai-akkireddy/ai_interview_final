export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const body = await req.json();

const prompt = `
You are an expert resume writer.

Generate a PROFESSIONAL ATS-friendly ONE PAGE resume in LaTeX.

STRICT RULES:

1. Must fit on ONE page
2. Clean professional formatting
3. No long paragraphs
4. Use bullet points
5. No duplicated links
6. Compact spacing
7. ATS friendly layout
8. Use standard LaTeX resume structure
9. Avoid unnecessary whitespace
10. Do NOT exceed one page

Use THIS exact template structure:

\\documentclass[letterpaper,10pt]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\begin{document}

\\begin{center}
{\\Large \\textbf{NAME}} \\\\
Email $|$ Phone $|$ Location \\\\
LinkedIn $|$ GitHub
\\end{center}

\\section*{Summary}
2 line professional summary for the role.

\\section*{Skills}
\\begin{itemize}[leftmargin=*]
\\item skill1, skill2, skill3
\\end{itemize}

\\section*{Experience}
\\textbf{Company} -- Position \\\\
Duration
\\begin{itemize}[leftmargin=*]
\\item achievement
\\item achievement
\\end{itemize}

\\section*{Projects}
\\textbf{Project Name}
\\begin{itemize}[leftmargin=*]
\\item description
\\end{itemize}

\\section*{Education}
Degree -- University

\\end{document}

Now fill the template using this candidate data:

Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone}
Location: ${body.location}
LinkedIn: ${body.linkedin}
GitHub: ${body.github}
Target Role: ${body.role}

Skills:
${body.skills}

Experience:
${body.experience}

Projects:
${body.projects}

Education:
${body.education}

Return ONLY the LaTeX code.
No explanation.
`;

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
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    }
  );

  const data = await ai.json();

  return NextResponse.json({
    resume: data.choices[0].message.content,
  });

}