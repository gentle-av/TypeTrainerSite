class HistoryEventHandler {
  constructor(eventManager, statsManager, authManager, notification) {
    this.eventManager = eventManager;
    this.statsManager = statsManager;
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
      const success = await this.statsManager.clearHistory();
      if (success) {
        this.notification.success("История очищена");
      } else {
        this.notification.error("Ошибка очистки истории");
      }
    }
  }
}

export { HistoryEventHandler };
