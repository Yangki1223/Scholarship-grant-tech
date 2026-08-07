import express from "express";
import { scholarships } from "../data/scholarships.js";
import { getStudent } from "../data/students.js";
import { callGroq } from "../utils/groq.js";

const router = express.Router();

const OFFLINE_ESSAYS = {
  "SCH-01": `When I took over as Lead of our school's Robotics Club, our team had never made it past regionals. Over the past year I restructured how we divided the build, coding, and strategy work, grounding every decision in what I was learning in my Computer Science courses.

Outside the workshop, I've spent over 60 hours volunteer tutoring younger students in maths and science, which sharpened how I explain technical ideas clearly.

My GPA of 3.7 reflects consistent effort across a Computer Science-focused course load, and this scholarship would let me keep building toward a tertiary CS degree without financial strain deciding which offer I can accept.`,
  "SCH-04": `Leading our Robotics Club has meant being one of the few girls directing the technical build in most competitions we've entered — a gap I want to help close rather than work around.

My Computer Science coursework and 3.7 GPA have given me the technical grounding to back that up, and my volunteer tutoring work has shown me how much representation matters when a younger student sees someone who looks like them solving the problem at the whiteboard.

This fund would help me stay focused on a CS degree in Aotearoa without needing to prioritise part-time work over the extracurricular technical projects that got me here.`
};

// POST draft an essay for a given scholarship, grounded in the
// student's real confirmed profile fields. Always returns a
// "draft — needs your voice/edit" label; never presented as final.
router.post("/:studentId/:scholarshipId", async (req, res) => {
  const student = getStudent(req.params.studentId);
  const scholarship = scholarships.find((s) => s.id === req.params.scholarshipId);
  if (!student || !scholarship) return res.status(404).json({ error: "Not found" });

  const p = student.profile;
  const confirmedFacts = Object.entries(p)
    .filter(([, v]) => v.confirmed)
    .map(([k, v]) => `${k}: ${v.value}`)
    .join("\n");

  const prompt = [
    {
      role: "system",
      content:
        "You draft first-pass scholarship application essays. Use ONLY the confirmed profile facts given — never invent achievements, numbers, or details not present. Keep it to 3-4 short paragraphs, first person, grounded and specific."
    },
    {
      role: "user",
      content: `Scholarship: ${scholarship.name}\nConfirmed student profile facts:\n${confirmedFacts}\n\nDraft the essay.`
    }
  ];

  try {
    const result = await callGroq(prompt, { temperature: 0.6 });
    const text = result.offline ? OFFLINE_ESSAYS[scholarship.id] || "[No offline draft available for this scholarship.]" : result.text;

    res.json({
      scholarshipId: scholarship.id,
      draft: text,
      status: "draft — needs your voice/edit",
      offline: result.offline,
      groundedIn: Object.keys(p).filter((k) => p[k].confirmed)
    });
  } catch (err) {
    res.status(500).json({ error: "Draft generation failed", detail: err.message });
  }
});

export default router;
