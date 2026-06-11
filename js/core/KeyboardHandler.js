export class KeyboardHandler {
  constructor() {
    this.handlers = new Map();
    this.active = false;
    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.active) return;
      const handler = this.handlers.get(e.key);
      if (handler) {
        handler(e);
        e.preventDefault();
      }
    });
  }

  register(key, handler) {
    this.handlers.set(key, handler);
  }

  unregister(key) {
    this.handlers.delete(key);
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  focus() {
    const input = document.createElement("input");
    input.style.position = "fixed";
    input.style.top = "-100px";
    input.style.left = "-100px";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.focus();
    setTimeout(() => input.remove(), 100);
  }
}
