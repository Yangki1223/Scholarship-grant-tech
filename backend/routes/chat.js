import express from "express";
import { scholarships } from "../data/scholarships.js";
import { getStudent } from "../data/students.js";
import { evaluateAll } from "../utils/matcher.js";
import { callGroq } from "../utils/groq.js";

const router = express.Router();

// POST ask the grounded chatbot a question. The eligibility check is
// always computed deterministically by the matcher first — the LLM
// only phrases the already-computed, cited answer. This guarantees
// the bot never fabricates a qualification.
router.post("/:studentId", async (req, res) => {
  const { question } = req.body;
  const student = getStudent(req.params.studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const evaluations = evaluateAll(scholarships, student.profile);

  const groundingContext = evaluations
    .map((e) => {
      const reqLines = e.requirementResults
        .map((r) => `  - ${r.label}: ${r.reason} (profile.${r.field}=${r.actual ?? "unconfirmed"})`)
        .join("\n");
      return `${e.name} [${e.scholarshipId}] — status: ${e.status}\n${reqLines}`;
    })
    .join("\n\n");

  const prompt = [
    {
      role: "system",
      content:
        "You are a scholarship eligibility assistant. You must answer ONLY using the eligibility evaluation data given below — never guess or assume a field's value. If a field is unconfirmed, say so explicitly and do not claim eligibility. Always name the specific profile field and requirement you compared. Be concise (2-4 sentences)."
    },
    {
      role: "user",
      content: `Eligibility evaluation data:\n${groundingContext}\n\nStudent question: ${question}`
    }
  ];

  try {
    const result = await callGroq(prompt, { temperature: 0.2 });
    let text = result.text;
    if (result.offline) {
      // Deterministic offline answer built directly from the evaluation
      // data, so the chatbot still demos meaningfully without a live key.
      const lower = question.toLowerCase();
      const hit = evaluations.find((e) => lower.includes(e.name.toLowerCase().split(" ")[0].toLowerCase()));
      if (hit) {
        const lines = hit.requirementResults
          .map((r) => `${r.label} → profile.${r.field}=${r.actual ?? "unconfirmed"} (${r.reason})`)
          .join("; ");
        text = `${hit.status === "match" ? "Yes, you're eligible" : hit.status === "close" ? "Not yet — partially eligible" : "Not eligible / cannot verify"} for ${hit.name}. ${lines}.`;
      } else {
        text = `I can only answer using your confirmed profile fields (${Object.entries(student.profile)
          .filter(([, v]) => v.confirmed)
          .map(([k, v]) => `${k}=${v.value}`)
          .join(", ")}). Ask about a specific scholarship by name.`;
      }
    }
    res.json({ answer: text, offline: result.offline, groundingData: evaluations });
  } catch (err) {
    res.status(500).json({ error: "Chat failed", detail: err.message });
  }
});

export default router;
