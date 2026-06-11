import { Api } from "../core/Api.js";

export class Leaderboard {
  constructor(api) {
    this.api = api;
    this.container = document.getElementById("leaderboard");
    this.setupClearButton();
  }

  setupClearButton() {
    const clearBtn = document.getElementById("clearHistoryBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", async () => {
        if (confirm("Вы уверены, что хотите очистить всю историю?")) {
          await this.clearHistory();
        }
      });
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
        await this.load();
        this.showNotification("История очищена", "success");
      }
    } catch (error) {
      console.error("Failed to clear history:", error);
      this.showNotification("Ошибка очистки истории", "error");
    }
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  async load() {
    try {
      const data = await this.api.getLeaderboard(5);
      this.render(data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      if (this.container) {
        this.container.innerHTML =
          '<div class="leaderboard-empty">Ошибка загрузки</div>';
      }
    }
  }

  render(data) {
    if (!this.container) return;
    if (data.length === 0) {
      this.container.innerHTML =
        '<div class="leaderboard-empty">Нет данных</div>';
      return;
    }
    this.container.innerHTML = data
      .map(
        (entry, index) => `
        <div class="leaderboard-item">
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-cpm">${Math.round(entry.cpm)} CPM</span>
        <span class="leaderboard-accuracy">${entry.accuracy.toFixed(1)}%</span>
        </div>
        `,
      )
      .join("");
  }
}
