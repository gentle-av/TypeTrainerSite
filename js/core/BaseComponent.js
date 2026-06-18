export class BaseComponent {
  constructor() {
    this.eventListeners = [];
    this.element = null;
  }

  createElement(tag, className = "", attributes = {}) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    Object.entries(attributes).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    this.element = el;
    return el;
  }

  addListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  destroy() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  render() {
    throw new Error("render() must be implemented");
  }
}
