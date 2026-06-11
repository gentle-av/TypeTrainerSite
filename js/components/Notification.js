export class Notification {
  constructor() {
    this.container = document.getElementById("notification-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "notification-container";
      document.body.appendChild(this.container);
    }
  }

  show(message, type = "info", duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    this.container.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
  }

  success(message) {
    this.show(message, "success");
  }

  error(message) {
    this.show(message, "error");
  }

  info(message) {
    this.show(message, "info");
  }
}
