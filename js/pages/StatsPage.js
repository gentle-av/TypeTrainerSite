export class StatsPage {
  render() {
    return `
      <h2>Моя статистика</h2>
      <div class="personal-stats">
        <div class="stat-card"><span class="stat-label">Всего тестов</span><span class="stat-value" id="totalTests">0</span></div>
        <div class="stat-card"><span class="stat-label">Средний CPM</span><span class="stat-value" id="avgCpm">0</span></div>
        <div class="stat-card"><span class="stat-label">Средняя точность</span><span class="stat-value" id="avgAccuracy">0</span></div>
        <div class="stat-card"><span class="stat-label">Лучший CPM</span><span class="stat-value" id="bestCpm">0</span></div>
      </div>
      <div id="leaderboard"></div>
      <div id="personalHistory"></div>
    `;
  }
}
