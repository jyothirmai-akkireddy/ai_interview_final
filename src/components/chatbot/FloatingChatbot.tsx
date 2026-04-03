"use client";

import { useState, useRef, useEffect } from "react";

type Job = {
title: string;
company: string;
location: string;
url: string;
};

type Message = {
role: "user" | "assistant";
reply?: string;
jobs?: Job[] | null;
};

export default function FloatingChatbot() {

const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);

const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, loading]);

/* ---------- LINK PARSER ---------- */

const renderText = (text: string) => {


const urlRegex = /(https?:\/\/[^\s]+)/g;

const parts = text.split(urlRegex);

return parts.map((part, i) => {

  if (part.match(urlRegex)) {

    return (
      <a
        key={i}
        href={part}
        target="_blank"
        className="text-purple-600 underline break-all"
      >
        {part}
      </a>
    );

  }

  return part;

});


};

/* ---------- SEND MESSAGE ---------- */

const sendMessage = async () => {


if (!input.trim()) return;

const text = input;

setMessages(prev => [
  ...prev,
  { role: "user", reply: text }
]);

setInput("");
setLoading(true);

try {

  const res = await fetch("/api/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: text,
      history: messages.slice(-8).map(m => ({
        role: m.role,
        content: m.reply
      }))
    }),
  });

  const data = await res.json();

  setMessages(prev => [
    ...prev,
    {
      role: "assistant",
      reply: data.reply,
      jobs: data.jobs
    }
  ]);

} catch {

  setMessages(prev => [
    ...prev,
    {
      role: "assistant",
      reply: "Network error. Try again."
    }
  ]);

}

setLoading(false);


};

return (
<>
{/* Floating Button */}


  <button
    onClick={() => setOpen(!open)}
    className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 text-white shadow-xl text-xl hover:scale-110 transition z-50"
  >
    💬
  </button>

  {open && (

    <div className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden z-50">

      {/* Header */}

      <div className="px-4 py-3 border-b font-semibold text-gray-800 bg-gray-50">
        AI Career Assistant
      </div>

      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((m, i) => (

          <div
            key={i}
            className={`flex ${
              m.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            {/* USER MESSAGE */}

            {m.role === "user" && (

              <div className="bg-purple-600 text-white px-4 py-2 rounded-2xl max-w-[70%] text-sm break-words">
                {m.reply}
              </div>

            )}

            {/* AI MESSAGE */}

            {m.role === "assistant" && (

              <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%] space-y-3">

                {m.reply && (
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {renderText(m.reply)}
                  </p>
                )}

                {/* JOB CARDS */}

                {m.jobs && m.jobs.length > 0 && (

                  <div className="space-y-3">

                    {m.jobs.map((job, idx) => (

                      <div
                        key={idx}
                        className="bg-white border rounded-xl p-3 shadow-sm"
                      >

                        <p className="font-semibold text-sm">
                          {job.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {job.company}
                        </p>

                        <p className="text-xs text-gray-400">
                          {job.location}
                        </p>

                        <a
                          href={job.url}
                          target="_blank"
                          className="inline-block mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700"
                        >
                          Apply
                        </a>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            )}

          </div>

        ))}

        {loading && (
          <p className="text-sm text-gray-500">
            Thinking...
          </p>
        )}

        <div ref={bottomRef} />

      </div>

      {/* Input */}

      <div className="border-t flex">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about interviews or jobs..."
          className="flex-1 p-3 text-sm outline-none text-black"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          className="px-5 text-purple-600 font-semibold"
        >
          Send
        </button>

      </div>

    </div>

  )}

</>


);
}
