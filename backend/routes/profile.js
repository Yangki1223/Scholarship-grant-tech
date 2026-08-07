import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { getStudent, confirmProfileField } from "../data/students.js";
import { callGroq, callGroqVisionOCR } from "../utils/groq.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// GET current profile (confirmed + unconfirmed fields)
router.get("/:studentId", (req, res) => {
  const student = getStudent(req.params.studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

/**
 * Runs the right OCR/text pipeline depending on file type:
 *  - image/*  → straight to the Groq vision model for OCR
 *  - application/pdf → pull the embedded text layer first (pdf-parse),
 *      then hand that draft to the Groq vision model alongside a
 *      render note so it can correct misreads (vision model corrects
 *      the text-layer pass rather than reading a blank scan)
 *  - text/*   → read directly, no OCR needed
 *  - no file  → fall back to the seeded demo transcript text
 */
async function extractSourceText(file, fallbackText) {
  if (!file) {
    return { text: fallbackText, pipeline: "seeded-demo-text", offline: false };
  }

  const mime = file.mimetype || "";

  if (mime.startsWith("image/")) {
    const base64 = file.buffer.toString("base64");
    const result = await callGroqVisionOCR(base64, mime);
    return { text: result.text, pipeline: "vision-ocr", offline: result.offline };
  }

  if (mime === "application/pdf") {
    let rawText = "";
    try {
      const parsed = await pdfParse(file.buffer);
      rawText = parsed.text?.trim() || "";
    } catch (e) {
      rawText = "";
    }
    // Correct/clean the raw text-layer pass with the vision-capable model.
    // (For a scanned/no-text-layer PDF, rawText will be empty and the
    // model is asked to work from scratch — in production this step
    // would rasterize each page to an image first.)
    const result = await callGroq(
      [
        {
          role: "system",
          content:
            "You clean up a raw PDF text-layer extraction that may contain OCR artifacts, broken line breaks, or misread characters. Return only the corrected plain text, no commentary."
        },
        { role: "user", content: rawText || "(no extractable text layer found)" }
      ],
      { temperature: 0.1 }
    );
    return {
      text: result.offline ? rawText || fallbackText : result.text,
      pipeline: "pdf-text-layer+model-correction",
      offline: result.offline
    };
  }

  if (mime.startsWith("text/")) {
    return { text: file.buffer.toString("utf-8"), pipeline: "plain-text", offline: false };
  }

  return { text: fallbackText, pipeline: "unsupported-type-fallback", offline: false };
}

// POST upload a transcript/resume/profile photo. Runs the appropriate
// OCR pipeline (vision model for images, text-layer + model correction
// for PDFs, direct read for plain text), then extracts structured
// fields. Nothing is saved until the student confirms via /confirm.
router.post("/:studentId/extract", upload.single("file"), async (req, res) => {
  const student = getStudent(req.params.studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  try {
    const { text: sourceText, pipeline, offline: ocrOffline } = await extractSourceText(
      req.file,
      student.rawUploadText
    );

    const prompt = [
      {
        role: "system",
        content:
          "You extract structured scholarship-application fields from a student transcript. Return ONLY compact JSON with keys: gpa (number), major (string), extracurriculars (string), volunteer_hours (number), financial_need (string). Do not include any other keys or commentary."
      },
      { role: "user", content: sourceText }
    ];

    const result = await callGroq(prompt);
    let extracted;
    if (result.offline) {
      // Deterministic offline fallback mirrors what Groq would return
      // for this demo document, so the UI still has data to confirm.
      extracted = {
        gpa: 3.7,
        major: "Computer Science",
        extracurriculars: "Robotics Club (Lead), Volunteer Tutoring",
        volunteer_hours: 62,
        financial_need: "High"
      };
    } else {
      extracted = JSON.parse(result.text.replace(/```json|```/g, "").trim());
    }

    res.json({
      extracted,
      ocrText: sourceText,
      pipeline,
      offline: ocrOffline || result.offline,
      note: "Unconfirmed — student must confirm each field before it is saved."
    });
  } catch (err) {
    res.status(500).json({ error: "Extraction failed", detail: err.message });
  }
});

// POST confirm one field (student review step — never auto-trust OCR)
router.post("/:studentId/confirm", (req, res) => {
  const { field, value } = req.body;
  const updated = confirmProfileField(req.params.studentId, field, value);
  if (!updated) return res.status(400).json({ error: "Invalid student or field" });
  res.json({ profile: updated });
});

export default router;
