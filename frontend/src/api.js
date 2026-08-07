// In local dev, Vite's proxy (vite.config.js) forwards "/api" to the
// backend on :4000. In production on Vercel, set VITE_API_BASE_URL to
// your deployed backend's URL (see README's Vercel deployment section).
const BASE = `${import.meta.env.VITE_API_BASE_URL || ""}/api`;
export const STUDENT_ID = "amara-okafor";

async function handle(res) {
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  getProfile: () => fetch(`${BASE}/profile/${STUDENT_ID}`).then(handle),
  extractProfile: (file) => {
    const opts = { method: "POST" };
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      opts.body = formData;
    }
    return fetch(`${BASE}/profile/${STUDENT_ID}/extract`, opts).then(handle);
  },
  confirmField: (field, value) =>
    fetch(`${BASE}/profile/${STUDENT_ID}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value })
    }).then(handle),

  getMatches: () => fetch(`${BASE}/matches/${STUDENT_ID}`).then(handle),

  draftEssay: (scholarshipId) =>
    fetch(`${BASE}/essay/${STUDENT_ID}/${scholarshipId}`, { method: "POST" }).then(handle),

  askChat: (question) =>
    fetch(`${BASE}/chat/${STUDENT_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    }).then(handle),

  getProgress: () => fetch(`${BASE}/progress/${STUDENT_ID}`).then(handle),
  setProgress: (scholarshipId, status) =>
    fetch(`${BASE}/progress/${STUDENT_ID}/${scholarshipId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).then(handle),

  getQueryService: (studentId, questions) => {
    const params = new URLSearchParams();
    if (studentId) params.append("studentId", studentId);
    if (questions) params.append("questions", questions);
    return fetch(`${BASE}/query-service?${params.toString()}`).then(handle);
  }
};
