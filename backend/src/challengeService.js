const normalizeTopic = (value) => (value || "all").toLowerCase();
const normalizeSource = (value) => (value || "all").toLowerCase();

const shuffle = (array) => {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

export class ChallengeService {
  constructor(provider) {
    this.provider = provider;
  }

  async listMetadata() {
    const challenges = await this.provider.loadChallenges();
    const topics = new Set();
    const sources = new Set();

    challenges.forEach((challenge) => {
      topics.add(challenge.topic || "general");
      sources.add(challenge.source || "local");
    });

    return {
      topics: Array.from(topics).sort(),
      sources: Array.from(sources).sort()
    };
  }

  async getChallenge({ topic, source } = {}) {
    const challenges = await this.provider.loadChallenges();
    const topicFilter = normalizeTopic(topic);
    const sourceFilter = normalizeSource(source);

    const filtered = challenges.filter((challenge) => {
      const challengeTopic = (challenge.topic || "general").toLowerCase();
      const challengeSource = (challenge.source || "local").toLowerCase();
      const topicMatches = topicFilter === "all" || challengeTopic === topicFilter;
      const sourceMatches = sourceFilter === "all" || challengeSource === sourceFilter;
      return topicMatches && sourceMatches;
    });

    const selectedPool = filtered.length > 0 ? filtered : challenges;
    const challenge = selectedPool[Math.floor(Math.random() * selectedPool.length)];

    return {
      id: challenge.id,
      topic: challenge.topic,
      source: challenge.source,
      prompt: challenge.prompt,
      correctIds: challenge.correctIds,
      tiles: shuffle(challenge.tiles)
    };
  }
}
