// Vercel serverless entry point. Wraps the Express app from server.js
// so the same backend code runs both locally (`node server.js`) and
// as a Vercel Function when deployed with the included vercel.json.
import serverless from "serverless-http";
import { app } from "../server.js";

export default serverless(app);
