export class History {
  constructor(api) {
    this.api = api;
    this.container = document.getElementById("historyList");
  }

  async load() {
    try {
      const data = await this.api.getHistory();
      this.render(data);
    } catch (error) {
      console.error("Failed to load history:", error);
      if (this.container) {
        this.container.innerHTML =
          '<div class="history-empty">Ошибка загрузки</div>';
      }
    }
  }

  render(data) {
    if (!this.container) return;
    if (data.length === 0) {
      this.container.innerHTML =
        '<div class="history-empty">Нет результатов</div>';
      return;
    }
    this.container.innerHTML = data
      .map(
        (entry) => `
      <div class="history-item">
      <span class="history-cpm">${Math.round(entry.cpm)} CPM</span>
      <span class="history-accuracy">${entry.accuracy.toFixed(1)}%</span>
      <span class="history-errors">Ошибок: ${entry.errors}</span>
      <span class="history-date">${new Date(entry.created_at).toLocaleString()}</span>
      </div>
      `,
      )
      .join("");
  }
}
