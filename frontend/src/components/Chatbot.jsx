import { useState, useRef, useEffect } from "react";
import { api } from "../api";

const SEED_MESSAGES = [
  { role: "user", text: "Am I eligible for the Community Impact Award?" },
  {
    role: "bot",
    text: "Not yet. Your logged volunteer hours (profile.volunteer_hours=62) clear the 50+ hour requirement, but the award also requires enrolment at a partner NZ institution, and that field isn't confirmed on your profile."
  }
];

export default function Chatbot() {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    logRef.current?.scrollTo(0, logRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const result = await api.askChat(q);
      setMessages((m) => [...m, { role: "bot", text: result.answer }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, something went wrong reaching the eligibility engine." }]);
    }
    setLoading(false);
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Grounded Q&amp;A chatbot</h2>
      <p className="text-sm text-gray-500 mb-6">
        Every answer is checked against Amara's actual confirmed profile fields — never a
        generic answer.
      </p>

      <div ref={logRef} className="card mb-4 space-y-4 overflow-y-auto" style={{ maxHeight: 420 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2.5 max-w-lg text-sm ${
                m.role === "user"
                  ? "bg-sky text-white rounded-2xl rounded-br-md"
                  : "bg-sky-tint border border-line rounded-2xl rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <p className="text-xs text-gray-400">Checking eligibility data…</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          type="text"
          placeholder="Ask about eligibility, e.g. 'am I eligible for the Women in Tech Fund?'"
          className="flex-1 px-4 py-2.5 rounded-lg text-sm border border-line"
        />
        <button onClick={send} className="px-5 py-2.5 rounded-lg font-semibold text-white bg-sky-deep">
          Ask
        </button>
      </div>
    </section>
  );
}
