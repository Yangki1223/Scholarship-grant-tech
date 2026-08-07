import { useEffect, useState } from "react";
import { api } from "../api";

const SCHOLARSHIP_META = {
  "SCH-01": { name: "STEM Merit Scholarship", deadline: "2026-10-15", eligible: true },
  "SCH-04": { name: "Women in Tech Aotearoa Fund", deadline: "2026-10-20", eligible: true },
  "SCH-03": { name: "Community Impact Award", deadline: "2026-09-30", eligible: "close" },
  "SCH-02": { name: "First-in-Family Leaders Grant", deadline: "2026-11-01", eligible: false }
};

const STATUS_OPTIONS = ["not_started", "drafting", "submitted"];
const STATUS_LABELS = { not_started: "Not started", drafting: "Drafting", submitted: "Submitted" };

export default function ProgressTracker() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    api.getProgress().then(setProgress);
  }, []);

  const update = async (id, status) => {
    const result = await api.setProgress(id, status);
    setProgress(result);
  };

  if (!progress) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Application progress</h2>
      <p className="text-sm text-gray-500 mb-6">Track where each matched scholarship stands.</p>

      <div className="space-y-3">
        {Object.entries(SCHOLARSHIP_META).map(([id, meta]) => {
          const status = progress[id]?.status || "not_started";
          const notEligible = meta.eligible === false;
          return (
            <div
              key={id}
              className={`card flex items-center justify-between flex-wrap gap-3 ${notEligible ? "opacity-60" : ""}`}
            >
              <div>
                <p className="font-bold">
                  {meta.name}{" "}
                  {meta.eligible === "close" && <span className="badge badge-close ml-1">close match</span>}
                  {meta.eligible === false && <span className="badge badge-no ml-1">not eligible</span>}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {id} · Deadline {meta.deadline}
                </p>
              </div>
              {notEligible ? (
                <select disabled className="border border-line rounded-lg px-3 py-1.5 text-sm font-semibold bg-gray-50">
                  <option>Not applicable</option>
                </select>
              ) : (
                <select
                  value={status}
                  onChange={(e) => update(id, e.target.value)}
                  className="border border-line rounded-lg px-3 py-1.5 text-sm font-semibold bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
