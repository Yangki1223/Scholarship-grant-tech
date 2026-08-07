import { useEffect, useState } from "react";
import { api } from "../api";

const STATUS_META = {
  match: { badge: "badge-match", label: "✓ Eligible match", border: "border-l-4 border-green-600" },
  close: { badge: "badge-close", label: "◐ Close — not yet eligible", border: "border-l-4 border-amber-500" },
  not_eligible: { badge: "badge-no", label: "✕ Not eligible", border: "border-l-4 border-crimson-deep opacity-90" }
};

function ScholarshipCard({ item }) {
  const meta = STATUS_META[item.status];
  return (
    <div className={`card ${meta.border}`}>
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <span className={`badge ${meta.badge} mb-2`}>{meta.label}</span>
          <h3 className="text-lg font-bold">{item.name}</h3>
          <p className="text-xs text-gray-500 font-mono">
            {item.scholarshipId} · Deadline {item.deadline} · {item.provider}
          </p>
        </div>
        <p className="text-2xl font-bold text-sky-deep">
          ${item.amountNZD}
          <span className="text-xs font-normal text-gray-500 block text-right">NZD</span>
        </p>
      </div>
      <div className="fern-divider my-3" style={{ height: "2px" }} />
      <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">
        Match explanation — field by field
      </p>
      <ul className="text-sm space-y-1.5">
        {item.requirementResults.map((r, i) => (
          <li key={i}>
            📌 Requirement: <b>{r.label}</b> → profile.{r.field} ={" "}
            <span className="font-mono">{r.actual ?? "unconfirmed"}</span> →{" "}
            <span className={r.met ? "text-green-700 font-semibold" : "text-crimson-deep font-semibold"}>
              {r.met ? "satisfied" : r.reason === "unconfirmed" ? "cannot verify — not satisfied" : "not satisfied"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Matches() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getMatches().then(setData);
  }, []);

  if (!data) return <p className="text-sm text-gray-400">Loading matches…</p>;

  const all = [...data.matches, ...data.close, ...data.notEligible];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Eligibility-grounded matches</h2>
      <p className="text-sm text-gray-500 mb-6">
        Only scholarships the confirmed profile actually satisfies show as real matches.
        Close-but-not-eligible and not-eligible results are kept visibly separate.
      </p>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="badge badge-match">● Eligible match</span>
        <span className="badge badge-close">● Close — one requirement unmet</span>
        <span className="badge badge-no">● Not eligible</span>
      </div>
      <div className="space-y-4">
        {all.map((item) => (
          <ScholarshipCard key={item.scholarshipId} item={item} />
        ))}
      </div>
    </section>
  );
}
