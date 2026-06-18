// js/core/StatsManager.js
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

  async clearHistory() {
    try {
      const response = await fetch("/api/history/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        await this.loadUserStats();
        await this.loadLeaderboard();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to clear history:", error);
      return false;
    }
  }
}

export { StatsManager };
