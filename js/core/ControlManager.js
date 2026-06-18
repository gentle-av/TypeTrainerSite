class ControlManager {
  constructor() {
    this.controls = {
      startBtn: null,
      resetBtn: null,
      difficultyBtns: [],
      clearHistoryBtn: null,
    };
  }

  init() {
    this.controls.startBtn = document.getElementById("startBtn");
    this.controls.resetBtn = document.getElementById("resetBtn");
    this.controls.difficultyBtns = document.querySelectorAll(".difficulty-btn");
    this.controls.clearHistoryBtn = document.getElementById("clearHistoryBtn");
  }

  setState(enabled) {
    const opacity = enabled ? "1" : "0.5";
    const cursor = enabled ? "pointer" : "not-allowed";
    Object.values(this.controls).forEach((control) => {
      if (control) {
        if (NodeList.prototype.isPrototypeOf(control)) {
          control.forEach((btn) =>
            this.setControlState(btn, enabled, opacity, cursor),
          );
        } else {
          this.setControlState(control, enabled, opacity, cursor);
        }
      }
    });
    document.body.classList.toggle("auth-locked", !enabled);
  }

  setControlState(control, enabled, opacity, cursor) {
    control.disabled = !enabled;
    control.style.opacity = opacity;
    control.style.cursor = cursor;
  }

  enable() {
    this.setState(true);
  }
  disable() {
    this.setState(false);
  }

  onStart(callback) {
    if (this.controls.startBtn) {
      this.controls.startBtn.addEventListener("click", callback);
    }
  }

  onReset(callback) {
    if (this.controls.resetBtn) {
      this.controls.resetBtn.addEventListener("click", callback);
    }
  }

  onClearHistory(callback) {
    if (this.controls.clearHistoryBtn) {
      this.controls.clearHistoryBtn.addEventListener("click", callback);
    }
  }

  onDifficultyChange(callback) {
    this.controls.difficultyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.controls.difficultyBtns.forEach((b) =>
          b.classList.remove("active"),
        );
        btn.classList.add("active");
        callback(btn.dataset.difficulty);
      });
    });
  }
}

export { ControlManager };
