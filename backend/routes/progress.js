import express from "express";
import { getStudent, setApplicationStatus } from "../data/students.js";

const router = express.Router();

router.get("/:studentId", (req, res) => {
  const student = getStudent(req.params.studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student.applications);
});

router.post("/:studentId/:scholarshipId", (req, res) => {
  const { status } = req.body; // "not_started" | "drafting" | "submitted"
  const updated = setApplicationStatus(req.params.studentId, req.params.scholarshipId, status);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

export default router;
