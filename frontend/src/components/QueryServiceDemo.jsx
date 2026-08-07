import { useEffect, useState } from "react";
import { api } from "../api";

export default function QueryServiceDemo() {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState("amara-okafor");
  const [questions, setQuestions] = useState("eligibility,student");
  const [loading, setLoading] = useState(false);

  async function load(id, questionInput) {
    setLoading(true);
    setError("");
    try {
      const data = await api.getQueryService(id, questionInput);
      setPayload(data);
    } catch (err) {
      setError(err.message || "Unable to load Query Service view.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(studentId, questions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRun() {
    load(studentId || undefined, questions || undefined);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky">Scholarship Query Studio</p>
            <h2 className="text-xl font-semibold">{payload?.title || "Scholarship Query Studio"}</h2>
          </div>
          <span className="rounded-full border border-sky px-3 py-1 text-xs font-semibold text-sky">
            {payload?.service || "Query Service"}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600">{payload?.description}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1.5fr_1fr]">
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Student ID (e.g. amara-okafor)"
          />
          <input
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Questions (eligibility,requirements,student,analysis)"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleRun} className="px-4 py-2 bg-sky text-white rounded-md text-sm font-semibold">
            {loading ? "Running…" : "Run Query"}
          </button>
          <p className="text-xs text-gray-500 self-center">Separate questions with commas.</p>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <strong>Valid questions:</strong> eligibility, requirements, student, analysis, all
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-line p-6 bg-white shadow-sm">
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      ) : !payload ? (
        <div className="rounded-2xl border border-line p-6 bg-white shadow-sm">
          <p className="text-sm text-gray-600">Loading demo view...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line p-5 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">Demo summary</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Student: {payload.summary.studentName}</li>
                <li>Scholarships in dataset: {payload.summary.scholarshipCount}</li>
                <li>High-confidence matches: {payload.summary.highConfidenceMatches}</li>
                <li>Top match: {payload.summary.topMatch}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-line p-5 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">Sample SQL</h3>
              <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">{payload.sampleQuery}</pre>
            </div>
          </div>

          {payload.extraTables?.map((table) => (
            <div key={table.title} className="rounded-2xl border border-line p-5 bg-white shadow-sm">
              <h3 className="font-semibold mb-2">{table.title}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      {table.columns.map((col) => (
                        <th key={col} className="py-2 pr-4 capitalize">
                          {col.replace(/([A-Z])/g, " $1")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, index) => (
                      <tr key={`${table.title}-${index}`} className="border-t border-line align-top">
                        {table.columns.map((col) => (
                          <td key={col} className="py-2 pr-4">
                            {row[col] ?? row[col.toLowerCase()] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-dashed border-sky p-5 bg-sky/5">
            <h3 className="font-semibold mb-2">Why this demo works</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {payload.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
