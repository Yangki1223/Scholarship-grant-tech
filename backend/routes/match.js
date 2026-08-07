import express from "express";
import { scholarships } from "../data/scholarships.js";
import { getStudent } from "../data/students.js";
import { evaluateAll } from "../utils/matcher.js";

const router = express.Router();

// GET eligibility-checked matches for a student.
// Always returns match / close / not_eligible buckets separately —
// never blends a "close" result in with a real match.
router.get("/:studentId", (req, res) => {
  const student = getStudent(req.params.studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const results = evaluateAll(scholarships, student.profile);

  res.json({
    matches: results.filter((r) => r.status === "match"),
    close: results.filter((r) => r.status === "close"),
    notEligible: results.filter((r) => r.status === "not_eligible")
  });
});

export default router;
