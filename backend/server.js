import express from "express";
import cors from "cors";
import "dotenv/config";

import profileRoutes from "./routes/profile.js";
import matchRoutes from "./routes/match.js";
import essayRoutes from "./routes/essay.js";
import chatRoutes from "./routes/chat.js";
import progressRoutes from "./routes/progress.js";
import { getQueryServicePayload } from "./utils/queryService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, service: "grantmatch-nz-backend" }));

app.get("/api/query-service", (req, res) => {
  try {
    const studentId = req.query.studentId;
    const questions = req.query.questions;
    const payload = getQueryServicePayload(studentId, questions);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message || "Query Service demo failed" });
  }
});

app.use("/api/profile", profileRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/essay", essayRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/progress", progressRoutes);

// Export the configured app so it can be wrapped for serverless
// deployment (see api/index.js) as well as run standalone via `node server.js`.
export { app };

if (process.env.VERCEL === undefined) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`GrantMatch NZ backend running on http://localhost:${PORT}`);
    console.log(`Demo student id: amara-okafor`);
  });
}
