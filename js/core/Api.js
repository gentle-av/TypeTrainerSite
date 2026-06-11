export class Api {
  constructor() {
    this.baseUrl = "";
  }

  async clearHistory() {
    return this.post("/api/history/clear", {});
  }

  async getHistory() {
    return this.get("/api/history");
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async getRandomText(difficulty = "medium") {
    console.log("Fetching random text, difficulty:", difficulty);
    const result = await this.get(`/api/text/random?difficulty=${difficulty}`);
    console.log("Random text result:", result);
    return result;
  }

  async saveTestResult(charactersTyped, errors, timeSeconds) {
    return this.post("/api/test/submit", {
      characters_typed: charactersTyped,
      errors: errors,
      time_seconds: timeSeconds,
    });
  }

  async getLeaderboard(limit = 10) {
    return this.get(`/api/leaderboard?limit=${limit}`);
  }

  async getStats() {
    return this.get("/api/stats");
  }

  async getUserStats() {
    return this.get("/api/user/stats");
  }
}
