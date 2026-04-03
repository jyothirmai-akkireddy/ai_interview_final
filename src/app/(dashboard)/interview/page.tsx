"use client";

import { useState, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import AIAvatar from "@/components/interview/AIAvatar";

type Difficulty = "easy" | "medium" | "hard";
type Tone = "friendly" | "strict";
type InterviewMode = "normal" | "final" | "rapid" | "hr" | "deep";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function InterviewPage() {

  /* ---------------- STATE (UNCHANGED) ---------------- */

  const [role, setRole] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [tone, setTone] = useState<Tone>("friendly");
  const [weakCount, setWeakCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewEnded, setInterviewEnded] = useState(false);

  const [mode, setMode] = useState<InterviewMode>("normal");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [transcript, setTranscript] = useState<
    { question: string; answer: string; score: number }[]
  >([]);

  const [summary, setSummary] = useState<any>(null);
  const [liveHint, setLiveHint] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<any>(null);

  const trackingRef = useRef({
    totalFrames: 0,
    faceDetectedFrames: 0,
    lookingAwayFrames: 0,
    headTurnFrames: 0,
    lowLightFrames: 0,
  });


  /* ---------------- CAMERA SYSTEM ---------------- */



  const startCameraTracking = async () => {
    if (!videoRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: any) => {
      trackingRef.current.totalFrames++;

      if (!results.multiFaceLandmarks?.length) return;

      trackingRef.current.faceDetectedFrames++;

      const landmarks = results.multiFaceLandmarks[0];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];

      const eyeCenterX = (leftEye.x + rightEye.x) / 2;

      if (eyeCenterX < 0.35 || eyeCenterX > 0.65) {
        trackingRef.current.lookingAwayFrames++;
      }

      if (Math.abs(leftEye.y - rightEye.y) > 0.05) {
        trackingRef.current.headTurnFrames++;
      }

      const video = videoRef.current;
      if (video) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          ).data;

          let brightness = 0;
          for (let i = 0; i < imageData.length; i += 4) {
            brightness += imageData[i];
          }

          const avg =
            brightness / (imageData.length / 4);

          if (avg < 60) {
            trackingRef.current.lowLightFrames++;
          }
        }
      }
    });

    const camera = new Camera(videoRef.current!, {
      onFrame: async () => {
        if (!videoRef.current) return;
        await faceMesh.send({
          image: videoRef.current as HTMLVideoElement,
        });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    cameraRef.current = camera;
  };

  const stopCameraTracking = () => {
    cameraRef.current?.stop();

    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
  };

  /* ---------------- ORIGINAL LOGIC CONTINUES UNTOUCHED ---------------- */
  useEffect(() => {
  if (
    mode !== "rapid" ||
    !question ||
    interviewEnded
  )
    return;

  setTimeLeft(30);

  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (!prev) return null;

      if (prev <= 1) {
        clearInterval(interval);
        evaluateAnswer();
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [question]);

  /* ---------------- LIVE HINT SYSTEM ---------------- */

  useEffect(() => {
    if (!question || !answer) {
      setLiveHint(null);
      return;
    }

    const wordCount = answer.trim().split(/\s+/).length;

    if (wordCount < 8) {
      setLiveHint("Try elaborating your answer more.");
      return;
    }

    const codingKeywords = [
      "function",
      "reverse",
      "array",
      "linked list",
      "algorithm",
      "code",
      "implement",
    ];

    const isCodingQuestion = codingKeywords.some((word) =>
      question.toLowerCase().includes(word)
    );

    const hasCodeSyntax =
      answer.includes(";") ||
      answer.includes("{") ||
      answer.includes("}") ||
      answer.includes("while") ||
      answer.includes("for");

    if (isCodingQuestion && !hasCodeSyntax) {
      setLiveHint(
        "Consider writing actual code for this question."
      );
      return;
    }

    if (
      answer.toLowerCase().includes("i think") ||
      answer.toLowerCase().includes("maybe") ||
      answer.length < 40
    ) {
      setLiveHint(
        "Try to be more specific and structured."
      );
      return;
    }

    setLiveHint(null);
  }, [answer, question]);

  /* ---------------- SPEECH RECOGNITION ---------------- */

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const finalTranscript =
        event.results[0][0].transcript;

      setAnswer((prev) =>
        prev ? prev + " " + finalTranscript : finalTranscript
      );
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

  /* ---------------- TEXT TO SPEECH ---------------- */

  const speak = (text: string, tone: Tone) => {
    return new Promise<void>((resolve) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = tone === "strict" ? 1.1 : 0.95;
      utterance.pitch = tone === "strict" ? 0.9 : 1.05;

      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  /* ---------------- SAVE INTERVIEW ---------------- */

  const saveInterview = async () => {
    const user = auth.currentUser;
    if (!user || transcript.length === 0) return;

    const avg =
      transcript.reduce((s, i) => s + i.score, 0) /
      transcript.length;

    await supabase.from("interviews").insert([
      {
        user_id: user.uid,
        transcript: JSON.stringify(transcript),
        score: Math.round(avg),
        evaluation: "Session completed",
        difficulty,
      },
    ]);
  };

  /* ---------------- GENERATE SUMMARY ---------------- */

  /* ---------------- GENERATE SUMMARY ---------------- */

const generateSummary = async (cameraMetrics?: any) => {
  if (!transcript.length) return;

  const transcriptText = transcript
    .map(
      (item, index) =>
        `Q${index + 1}: ${item.question}
A: ${item.answer}
Score: ${item.score}`
    )
    .join("\n\n");

  const res = await fetch("/api/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      transcript: transcriptText,
      cameraMetrics,   // ✅ THIS is the fix
    }),
  });

  const data = await res.json();
  setSummary(data);

  if (data.overallRating) {
    await speak(
      `Your overall performance was ${data.overallRating}.`,
      tone
    );
  }
};

  /* ---------------- GENERATE QUESTION ---------------- */

  const generateQuestion = async (
    diff: Difficulty,
    t: Tone,
    isFirst = false
  ) => {
    stopListening();
    setLoading(true);
    setAnswer("");
    setFeedback(null);
    setScore(null);

    if (isFirst) {
      await speak(
        `Starting your interview for the role of ${role}. Here is your first question.`,
        t
      );
    }

    const res = await fetch("/api/generate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
body: JSON.stringify({
  difficulty: diff,
  tone: t,
  role,
  mode,
}),
    });

    const data = await res.json();

    setQuestion(data.question);
    await speak(data.question, t);

    setLoading(false);
  };

  const startInterview = () => {
    if (!role.trim()) {
      alert("Please enter a role.");
      return;
    }

 let initialDifficulty: Difficulty = "easy";

if (mode === "final" || mode === "deep")
  initialDifficulty = "hard";

if (mode === "hr")
  initialDifficulty = "medium";

setDifficulty(initialDifficulty);
    setTone("friendly");
    setWeakCount(0);
    setQuestionCount(0);
    setTranscript([]);
    setSummary(null);
    setInterviewEnded(false);
startCameraTracking();
    generateQuestion(initialDifficulty, "friendly", true);
  };

  /* ---------------- EVALUATE ANSWER ---------------- */

const evaluateAnswer = async () => {
  if (!question || !answer) return;

  stopListening();
  setLoading(true);

  const res = await fetch("/api/evaluate-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer }),
  });

  const data = await res.json();

  setFeedback(data.feedback);
  setScore(data.score);

  setTranscript((prev) => [
    ...prev,
    { question, answer, score: data.score },
  ]);

  let newDifficulty = difficulty;
  let newTone = tone;
  let newWeak = weakCount;

  if (data.score >= 80) {
    newDifficulty =
      difficulty === "easy"
        ? "medium"
        : difficulty === "medium"
        ? "hard"
        : "hard";
  }

  if (data.score < 50) {
    newWeak += 1;
    newTone = "strict";
  } else {
    newTone = "friendly";
  }

  setWeakCount(newWeak);
  setDifficulty(newDifficulty);
  setTone(newTone);

  const next = questionCount + 1;
  setQuestionCount(next);

  /* ----------- INTERVIEW END CONDITION ----------- */

let maxQuestions = 10;

if (mode === "final") maxQuestions = 5;
if (mode === "hr") maxQuestions = 7;
if (mode === "deep") maxQuestions = 6;
if (mode === "rapid") maxQuestions = 8;

if (newWeak >= 3 || next >= maxQuestions) {
    window.speechSynthesis.cancel();
    stopCameraTracking();

    const metrics = trackingRef.current;

    const eyeContact =
      (metrics.faceDetectedFrames -
        metrics.lookingAwayFrames) /
      (metrics.faceDetectedFrames || 1);

    const computedMetrics = {
      eyeContactPercentage: Math.round(eyeContact * 100),
      headTurnCount: metrics.headTurnFrames,
      lowLightCount: metrics.lowLightFrames,
    };

    setInterviewEnded(true);

    await saveInterview();

    // 🔥 Now passing camera metrics to summary route
    await generateSummary(computedMetrics);

    setLoading(false);
    return;
  }




  /*----------interview end summary----------------------------

  

  /* ----------- CONTINUE INTERVIEW ----------- */

  setLoading(false);

  setTimeout(() => {
    generateQuestion(newDifficulty, newTone);
  }, 1200);
};
  /* ---------------- UI ---------------- */

return (
  <main className="px-6 py-10 min-h-screen bg-transparent text-white">

    <Card className="max-w-3xl mx-auto space-y-8 relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">

      <AIAvatar speaking={isSpeaking} visible={!interviewEnded} />

      {/* Camera */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="fixed top-6 right-6 w-28 h-28 rounded-full object-cover border border-white/20 shadow-xl z-50"
      />

      {/* ---------------- START SCREEN ---------------- */}
      {!question && !interviewEnded && (
        <>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Normal", value: "normal" },
              { label: "Final Round", value: "final" },
              { label: "Rapid Fire", value: "rapid" },
              { label: "HR Round", value: "hr" },
              { label: "Deep Dive", value: "deep" },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value as InterviewMode)}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  mode === m.value
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Enter the role (SDE Intern, Frontend Developer, Java Backend)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            rows={2}
            className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

          <Button onClick={startInterview}>
            Start Interview
          </Button>
        </>
      )}

      {/* ---------------- QUESTION SCREEN ---------------- */}
      {question && !interviewEnded && (
        <>
          {mode === "rapid" && timeLeft != null && (
            <div className="text-sm font-semibold text-red-400">
              ⏱ {timeLeft}s
            </div>
          )}

          <div className="flex gap-4 items-start">

            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold
              ${isSpeaking ? "bg-purple-600 animate-pulse" : "bg-gray-600"}`}
            >
              AI
            </div>

            <div className="flex-1">
              {isSpeaking && (
                <div className="text-sm text-purple-400 mb-1">
                  Interviewer speaking...
                </div>
              )}
              <p className="font-semibold text-lg">
                {question}
              </p>
            </div>

          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={8}
            className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

          {liveHint && (
            <div className="bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 px-4 py-2 rounded-lg text-sm">
              💡 {liveHint}
            </div>
          )}

          <div className="flex gap-3">
            {!isListening ? (
              <Button variant="secondary" onClick={startListening}>
                🎤
              </Button>
            ) : (
              <Button variant="secondary" onClick={stopListening}>
                ⏹
              </Button>
            )}
          </div>

          <Button onClick={evaluateAnswer}>
            {loading ? "Evaluating..." : "Submit"}
          </Button>

          {feedback && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
              <p className="font-semibold">
                Score: {score}
              </p>
              <p className="text-sm text-gray-300">
                {feedback}
              </p>
            </div>
          )}
        </>
      )}

      {/* ---------------- SUMMARY SCREEN ---------------- */}
      {interviewEnded && summary && (
        <div className="space-y-8">

          <h2 className="text-2xl font-bold tracking-tight">
            Interview Performance Report
          </h2>

          <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 space-y-8">

            <div>
              <p className="text-sm text-gray-400">
                Overall Rating
              </p>
              <p className="text-xl font-semibold">
                {summary.overallRating}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Confidence Score
              </p>
              <p className="text-xl font-semibold">
                {summary.confidenceScore}%
              </p>
            </div>

            {summary.strengths?.length > 0 && (
              <div>
                <p className="font-semibold text-green-400 mb-2">
                  Strengths
                </p>
                <ul className="list-disc ml-5 text-gray-300 space-y-1">
                  {summary.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.weakAreas?.length > 0 && (
              <div>
                <p className="font-semibold text-red-400 mb-2">
                  Weak Areas
                </p>
                <ul className="list-disc ml-5 text-gray-300 space-y-1">
                  {summary.weakAreas.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.improvementPlan?.length > 0 && (
              <div>
                <p className="font-semibold mb-2">
                  Improvement Plan
                </p>
                <ul className="list-disc ml-5 text-gray-300 space-y-1">
                  {summary.improvementPlan.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          <Button onClick={startInterview}>
            Restart Interview
          </Button>

        </div>
      )}

    </Card>

  </main>
); }