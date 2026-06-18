export class EventManager {
  constructor() {
    this.handlers = new Map();
    this.domListeners = [];
  }

  on(event, callback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(callback);
    return callback;
  }

  off(event, callback) {
    if (!this.handlers.has(event)) return;
    const handlers = this.handlers.get(event);
    const index = handlers.indexOf(callback);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event, data = {}) {
    if (!this.handlers.has(event)) return;
    this.handlers.get(event).forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  clear() {
    this.handlers.clear();
    this.domListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.domListeners = [];
  }

  addDomListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.domListeners.push({ element, event, handler });
  }

  addWindowListener(event, handler) {
    window.addEventListener(event, handler);
    this.domListeners.push({ element: window, event, handler });
  }
}
