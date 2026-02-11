import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ChallengeService } from "./challengeService.js";
import { LocalJsonChallengeProvider } from "./providers/challengeProvider.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);
const challengeProvider = new LocalJsonChallengeProvider(path.join(__dirname, "../../data/challenges.json"));
const challengeService = new ChallengeService(challengeProvider);

app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/api/metadata", async (_req, res) => {
  try {
    const metadata = await challengeService.listMetadata();
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ message: "Unable to load metadata", detail: error.message });
  }
});

app.get("/api/challenges/random", async (req, res) => {
  try {
    const challenge = await challengeService.getChallenge({
      topic: req.query.topic,
      source: req.query.source
    });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Unable to load challenge", detail: error.message });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`recapture running at http://localhost:${port}`);
});
