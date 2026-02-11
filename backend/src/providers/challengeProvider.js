import fs from "node:fs/promises";
import path from "node:path";

export class ChallengeProvider {
  async loadChallenges() {
    throw new Error("Not implemented");
  }
}

export class LocalJsonChallengeProvider extends ChallengeProvider {
  constructor(dataPath) {
    super();
    this.dataPath = dataPath;
  }

  async loadChallenges() {
    const resolvedPath = path.resolve(this.dataPath);
    const raw = await fs.readFile(resolvedPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.challenges)) {
      throw new Error("Invalid challenge file: expected 'challenges' array");
    }

    return parsed.challenges;
  }
}
