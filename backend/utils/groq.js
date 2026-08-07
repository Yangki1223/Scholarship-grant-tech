import fetch from "node-fetch";
import "dotenv/config";

const GROQ_ENDPOINT = process.env.GROQ_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_VISION_MODEL = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Calls the Groq chat completions endpoint.
 * Falls back to a clearly-labelled offline stub if no API key is set,
 * so the prototype still runs end-to-end without live credentials.
 */
export async function callGroq(messages, { temperature = 0.4 } = {}) {
  if (!GROQ_API_KEY || GROQ_API_KEY.startsWith("gsk_replace")) {
    return {
      offline: true,
      text: "[Offline demo mode — no GROQ_API_KEY set. Add a real key to backend/.env to get live model output.]"
    };
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature,
      messages
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { offline: false, text };
}

/**
 * Sends a base64-encoded image (or PDF page rendered as an image) to a
 * Groq vision-capable model, asking it to read/OCR the document and
 * correct any garbled characters a plain text-layer extraction might
 * have produced. Falls back to an offline stub if no API key is set.
 *
 * @param {string} base64Data - raw base64 (no data: prefix)
 * @param {string} mimeType - e.g. "image/png", "image/jpeg"
 * @param {string} draftText - optional plain-text OCR/text-layer pass to correct against
 */
export async function callGroqVisionOCR(base64Data, mimeType, draftText = "") {
  if (!GROQ_API_KEY || GROQ_API_KEY.startsWith("gsk_replace")) {
    return {
      offline: true,
      text:
        draftText ||
        "[Offline demo mode — no GROQ_API_KEY set. Add a real key to backend/.env to run live vision OCR.]"
    };
  }

  const instructions = draftText
    ? `Here is a raw text-layer extraction of this document, which may contain OCR errors, missing line breaks, or misread characters:\n\n"""${draftText}"""\n\nLook at the image and produce a corrected, clean plain-text transcription of the document, fixing anything the raw extraction got wrong. Return only the corrected text, no commentary.`
    : "Read this document image and produce a clean plain-text transcription of everything on it. Return only the transcribed text, no commentary.";

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: instructions },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq vision API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { offline: false, text };
}
