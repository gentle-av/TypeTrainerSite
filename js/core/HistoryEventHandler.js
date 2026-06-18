class HistoryEventHandler {
  constructor(eventManager, leaderboard, history, authManager, notification) {
    this.eventManager = eventManager;
    this.leaderboard = leaderboard;
    this.history = history;
    this.authManager = authManager;
    this.notification = notification;
  }

  init() {
    this.eventManager.on("history:clear", this.handleClear.bind(this));
  }

  async handleClear() {
    if (!this.authManager.isLoggedIn()) {
      this.notification.error("Необходимо авторизоваться");
      this.eventManager.emit("auth:open");
      return;
    }
    if (confirm("Вы уверены, что хотите очистить всю историю?")) {
      await this.leaderboard.clearHistory();
      await this.history.load();
      this.notification.success("История очищена");
    }
  }
}

export { HistoryEventHandler };
