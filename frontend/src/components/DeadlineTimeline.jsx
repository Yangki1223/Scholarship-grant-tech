import { useEffect, useState } from "react";
import { api } from "../api";

const STATUS_BADGE = {
  match: <span className="badge badge-match ml-1">eligible</span>,
  close: <span className="badge badge-close ml-1">close match</span>,
  not_eligible: <span className="badge badge-no ml-1">not eligible</span>
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date("2026-08-02");
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default function DeadlineTimeline() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getMatches().then((data) => {
      const all = [...data.matches, ...data.close, ...data.notEligible];
      all.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setItems(all);
    });
  }, []);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Deadline timeline</h2>
      <p className="text-sm text-gray-500 mb-6">
        Matched scholarships sorted by urgency. Today: 2 August 2026.
      </p>

      <div className="relative pl-2 space-y-6">
        {items.map((item, i) => {
          const days = daysUntil(item.deadline);
          const urgent = i === 0 && item.status !== "not_eligible";
          return (
            <div key={item.scholarshipId} className="flex gap-4">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0 ${
                  urgent ? "bg-crimson" : item.status === "not_eligible" ? "bg-gray-300 text-gray-600" : "bg-sky"
                }`}
              >
                {days}d
              </div>
              <div
                className={`card flex-1 ${
                  item.status === "not_eligible" ? "border-l-4 border-crimson-deep opacity-80" : urgent ? "border-l-4 border-crimson" : "border-l-4 border-green-600"
                }`}
              >
                <div className="flex justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold">
                      {item.name} {STATUS_BADGE[item.status]}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{item.scholarshipId}</p>
                  </div>
                  <p className={`font-bold ${item.status === "not_eligible" ? "text-gray-500" : ""}`}>
                    {item.deadline}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
