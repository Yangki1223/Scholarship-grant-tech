import { useEffect, useState } from "react";
import { api } from "../api";

const FIELD_LABELS = {
  gpa: "NCEA-equivalent GPA",
  major: "Intended major",
  extracurriculars: "Extracurriculars",
  volunteer_hours: "Volunteer hours logged",
  financial_need: "Financial need (StudyLink indicator)",
  first_in_family: "First-in-family to attend university",
  gender: "Gender"
};

const PIPELINE_LABELS = {
  "vision-ocr": "🔍 Vision model OCR (image)",
  "pdf-text-layer+model-correction": "📄 PDF text layer + model correction",
  "plain-text": "📝 Plain text (no OCR needed)",
  "seeded-demo-text": "🧪 Seeded demo transcript (no file uploaded)",
  "unsupported-type-fallback": "⚠️ Unsupported file type — used demo transcript"
};

export default function ProfileIntake() {
  const [profile, setProfile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [ocrMeta, setOcrMeta] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getProfile().then((s) => setProfile(s.profile));
  }, []);

  const runExtraction = async () => {
    setLoading(true);
    const result = await api.extractProfile(file);
    setExtracted(result.extracted);
    setOcrMeta({ pipeline: result.pipeline, ocrText: result.ocrText, offline: result.offline });
    setLoading(false);
  };

  const confirm = async (field, value) => {
    const result = await api.confirmField(field, value);
    setProfile(result.profile);
    // Once a field is confirmed, drop it from the pending-extraction diff
    // so the row falls back to showing the saved profile value.
    setExtracted((prev) => {
      if (!prev) return prev;
      const { [field]: _drop, ...rest } = prev;
      return rest;
    });
  };

  if (!profile) return <p className="text-sm text-gray-400">Loading profile…</p>;

  // Fields the last extraction proposed a value for that differs from
  // (or fills a gap in) the currently saved profile. Nothing here is
  // saved yet — it's only surfaced so the student can confirm it.
  const pendingByField = {};
  if (extracted) {
    for (const [field, value] of Object.entries(extracted)) {
      if (!(field in profile)) continue; // extraction returned a field we don't track
      const current = profile[field];
      const changed = !current.confirmed || String(current.value) !== String(value);
      if (changed && value !== null && value !== undefined && value !== "") {
        pendingByField[field] = value;
      }
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Profile &amp; transcript intake</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload a NCEA transcript, CV, or profile doc. OCR + Groq extraction pulls out
        structured fields — you confirm before anything is saved.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-wide mb-3 text-sky-deep">
            Uploaded document
          </p>
          <label className="border-2 border-dashed border-sky rounded-xl p-6 text-center mb-4 bg-sky-tint block cursor-pointer">
            <input
              type="file"
              accept="image/*,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm font-semibold">
              {file ? file.name : "NCEA_Transcript_Amara_Okafor.pdf"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {file
                ? `${(file.size / 1024).toFixed(0)} KB — click to change file`
                : "Click to upload a photo, PDF, or text file — or leave empty to use the seeded demo doc"}
            </p>
          </label>
          <button
            onClick={runExtraction}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-white bg-sky-deep disabled:opacity-50"
          >
            {loading ? "Running OCR + Groq extraction…" : "Run extraction"}
          </button>

          {ocrMeta && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Pipeline used</span>
                <span className="badge badge-draft">{PIPELINE_LABELS[ocrMeta.pipeline] || ocrMeta.pipeline}</span>
              </div>
              {ocrMeta.offline && (
                <p className="text-xs text-crimson-deep">
                  Offline demo mode — add a real GROQ_API_KEY to backend/.env for live vision OCR.
                </p>
              )}
              <details className="text-xs">
                <summary className="cursor-pointer text-sky-deep font-semibold">View corrected OCR text</summary>
                <pre className="mt-2 p-3 rounded-lg bg-gray-50 border border-line whitespace-pre-wrap">
                  {ocrMeta.ocrText}
                </pre>
              </details>
            </div>
          )}

          {extracted && (
            <div className="text-xs font-mono mt-3 p-3 rounded-lg bg-gray-50 border border-line">
              {JSON.stringify(extracted, null, 2)}
            </div>
          )}
        </div>

        <div className="card">
          <p className="text-xs font-bold uppercase tracking-wide mb-3 text-sky-deep">
            Profile fields — confirm before saving
          </p>
          <div className="space-y-3">
            {Object.entries(profile).map(([field, entry]) => {
              const pendingValue = pendingByField[field];
              const hasPending = pendingValue !== undefined;

              return (
                <div
                  key={field}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    hasPending ? "bg-amber-50 border border-amber-200" : entry.confirmed ? "bg-gray-50" : "bg-red-50"
                  }`}
                >
                  <div>
                    <p className="text-xs text-gray-500">{FIELD_LABELS[field] || field}</p>
                    {hasPending ? (
                      <>
                        {entry.confirmed && (
                          <p className="text-xs text-gray-400 line-through">{String(entry.value)}</p>
                        )}
                        <p className="font-bold">
                          {String(pendingValue)}{" "}
                          <span className="text-xs font-normal text-amber-700">— from latest extraction</span>
                        </p>
                      </>
                    ) : (
                      <p className="font-bold">
                        {entry.confirmed ? String(entry.value) : "Not stated — needs confirmation"}
                      </p>
                    )}
                  </div>
                  {hasPending ? (
                    <button
                      className="badge badge-draft cursor-pointer"
                      onClick={() => confirm(field, pendingValue)}
                    >
                      ✓ confirm new value
                    </button>
                  ) : entry.confirmed ? (
                    <span className="badge badge-match">✓ confirmed</span>
                  ) : (
                    <button
                      className="badge badge-no cursor-pointer"
                      onClick={() => {
                        const val = prompt(`Enter value for "${FIELD_LABELS[field] || field}"`);
                        if (val !== null && val !== "") {
                          const parsed = val === "true" ? true : val === "false" ? false : val;
                          confirm(field, parsed);
                        }
                      }}
                    >
                      ⚠ confirm now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Unconfirmed fields are never guessed by the matcher or the chatbot.
          </p>
        </div>
      </div>
    </section>
  );
}
