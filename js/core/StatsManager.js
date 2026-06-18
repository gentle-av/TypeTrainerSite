class StatsManager {
  constructor(api, pageBuilder) {
    this.api = api;
    this.pageBuilder = pageBuilder;
  }

  async loadUserStats() {
    try {
      const response = await fetch("/api/user/stats");
      if (!response.ok) return;
      const data = await response.json();
      const statsPage = this.pageBuilder.getPageInstance("stats");
      if (statsPage) {
        statsPage.updateStats(data);
      }
      return data;
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  }

  async loadLeaderboard() {
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) return;
      const data = await response.json();
      const statsPage = this.pageBuilder.getPageInstance("stats");
      if (statsPage) {
        statsPage.updateLeaderboard(data);
      }
      return data;
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }
}

export { StatsManager };
