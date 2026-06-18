export class StatsPage {
  constructor() {
    this.stats = {
      totalTests: 0,
      avgCpm: 0,
      avgAccuracy: 0,
      bestCpm: 0,
      history: [],
    };
  }

  render() {
    return `
      <div class="stats-page">
        <h2>Моя статистика</h2>
        <div class="personal-stats">
          <div class="stat-card">
            <span class="stat-label">Всего тестов</span>
            <span class="stat-value" id="totalTests">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Средний CPM</span>
            <span class="stat-value" id="avgCpm">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Средняя точность</span>
            <span class="stat-value" id="avgAccuracy">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Лучший CPM</span>
            <span class="stat-value" id="bestCpm">0</span>
          </div>
        </div>
        <div id="leaderboard"></div>
        <div id="personalHistory"></div>
      </div>
    `;
  }

  updateStats(stats) {
    this.stats = { ...this.stats, ...stats };
    this.renderStats();
  }

  renderStats() {
    this.updateElement("totalTests", this.stats.totalTests || 0);
    this.updateElement("avgCpm", Math.round(this.stats.avgCpm || 0));
    this.updateElement("avgAccuracy", (this.stats.avgAccuracy || 0).toFixed(1));
    this.updateElement("bestCpm", this.stats.bestCpm || 0);
    this.renderHistory(this.stats.history || []);
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  renderHistory(history) {
    const container = document.getElementById("personalHistory");
    if (!container) return;
    if (history.length === 0) {
      container.innerHTML = '<div class="history-empty">Нет результатов</div>';
    } else {
      container.innerHTML = history
        .map((entry) => this.createHistoryEntry(entry))
        .join("");
    }
  }

  createHistoryEntry(entry) {
    return `
      <div class="history-item">
        <span class="history-cpm">${Math.round(entry.cpm)} CPM</span>
        <span class="history-accuracy">${entry.accuracy.toFixed(1)}%</span>
        <span class="history-errors">Ошибок: ${entry.errors}</span>
        <span class="history-characters">Символов: ${entry.characters}</span>
        <span class="history-date">${new Date(entry.created_at).toLocaleString()}</span>
      </div>
    `;
  }

  updateLeaderboard(leaderboardData) {
    const container = document.getElementById("leaderboard");
    if (!container) return;
    if (!leaderboardData || leaderboardData.length === 0) {
      container.innerHTML = '<div class="empty">Нет данных</div>';
      return;
    }

    container.innerHTML = `
      <h3>🏆 Лидерборд</h3>
      <div class="leaderboard-list">
        ${leaderboardData
          .map(
            (item, index) => `
          <div class="leaderboard-item">
            <span class="rank">#${index + 1}</span>
            <span class="name">${item.login || "Аноним"}</span>
            <span class="score">${Math.round(item.cpm)} CPM</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }
}
