import { useEffect, useState } from "react";
import { api } from "../api";

const ELIGIBLE_SCHOLARSHIPS = [
  { id: "SCH-01", name: "STEM Merit Scholarship" },
  { id: "SCH-04", name: "Women in Tech Aotearoa Fund" }
];

export default function EssayDrafts() {
  const [active, setActive] = useState("SCH-01");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDraft = async (id) => {
    setLoading(true);
    setActive(id);
    const result = await api.draftEssay(id);
    setDraft(result);
    setLoading(false);
  };

  useEffect(() => {
    loadDraft("SCH-01");
  }, []);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Tailored essay drafts</h2>
      <p className="text-sm text-gray-500 mb-6">
        Drafted from Amara's real confirmed profile details via Groq. Always a first pass —
        never submission-ready.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {ELIGIBLE_SCHOLARSHIPS.map((s) => (
          <button
            key={s.id}
            onClick={() => loadDraft(s.id)}
            className={`tab-btn px-4 py-2 rounded-full text-sm font-semibold border ${
              active === s.id ? "bg-sky text-white border-sky" : "border-line"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <span className="badge badge-draft">✎ Draft — needs your voice / edit</span>
          <button
            onClick={() => loadDraft(active)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-tint text-sky-deep"
          >
            Regenerate
          </button>
        </div>

        {loading || !draft ? (
          <p className="text-sm text-gray-400">Drafting…</p>
        ) : (
          <>
            <div className="text-sm leading-relaxed space-y-3 whitespace-pre-line" style={{ color: "#2A3E4E" }}>
              {draft.draft}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Grounded in confirmed fields: {draft.groundedIn.join(", ")}
              {draft.offline && " — offline demo draft (no live GROQ_API_KEY set)"}
            </p>
            <div className="mt-4 p-3 rounded-lg text-xs bg-red-50 text-crimson-deep">
              This is a first-pass draft only. Read it fully, rewrite it in your own voice, and
              confirm every detail before using it in an application.
            </div>
          </>
        )}
      </div>
    </section>
  );
}
