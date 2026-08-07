import { useState } from "react";
import ProfileIntake from "./components/ProfileIntake.jsx";
import Matches from "./components/Matches.jsx";
import EssayDrafts from "./components/EssayDrafts.jsx";
import DeadlineTimeline from "./components/DeadlineTimeline.jsx";
import Chatbot from "./components/Chatbot.jsx";
import ProgressTracker from "./components/ProgressTracker.jsx";
import QueryServiceDemo from "./components/QueryServiceDemo.jsx";

const TABS = [
  { id: "profile", label: "① Profile intake", Component: ProfileIntake },
  { id: "matches", label: "② Eligible matches", Component: Matches },
  { id: "essay", label: "③ Essay drafts", Component: EssayDrafts },
  { id: "deadlines", label: "④ Deadline timeline", Component: DeadlineTimeline },
  { id: "chat", label: "⑤ Grounded Q&A", Component: Chatbot },
  { id: "progress", label: "⑥ Application progress", Component: ProgressTracker },
  { id: "query-service", label: "⑦ Query Service", Component: QueryServiceDemo }
];

export default function App() {
  const [active, setActive] = useState("profile");
  const ActiveComponent = TABS.find((t) => t.id === active).Component;

  return (
    <div>
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky to-sky-deep flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C9 6 4 8 4 8s1 8 8 14c7-6 8-14 8-14s-5-2-8-6z"
                  stroke="white"
                  strokeWidth="1.6"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ letterSpacing: "-0.01em" }}>
                GrantMatch <span className="text-crimson">NZ</span>
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Scholarship &amp; financial aid matchmaker · Aotearoa New Zealand
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">Amara Okafor</p>
              <p className="text-xs text-gray-500">Year 13 · Wellington</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white font-display"
              style={{ background: "#D93A3A" }}
            >
              AO
            </div>
          </div>
        </div>
        <div className="fern-divider" />
      </header>

      <nav className="max-w-6xl mx-auto px-6 py-4 flex gap-2 flex-wrap sticky top-0 bg-white z-10 border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap ${
              active === tab.id ? "bg-sky border-sky text-white shadow-md" : "border-line hover:border-sky"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ActiveComponent />
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-gray-400 text-center">
        GrantMatch NZ — full-stack build · React + Vite + Tailwind + Express + Groq · demo data
        · sample student "Amara Okafor" · Query Service showcase for panel demos
      </footer>
    </div>
  );
}
