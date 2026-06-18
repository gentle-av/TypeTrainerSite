import { TextDisplay } from "../components/TextDisplay.js";

export class TrainPage {
  constructor() {
    this.stats = {
      cpm: 0,
      wpm: 0,
      accuracy: 100,
      errors: 0,
    };
    this.difficulty = "medium";
    this.textDisplay = new TextDisplay("textDisplay");
    this.startCallback = null;
    this.resetCallback = null;
  }

  render() {
    return `
      <div class="train-page">
        <div class="train-header">
          <div class="difficulty-selector">
            <button class="difficulty-btn" data-difficulty="easy">Легкий</button>
            <button class="difficulty-btn active" data-difficulty="medium">Средний</button>
            <button class="difficulty-btn" data-difficulty="hard">Тяжелый</button>
          </div>
        </div>
        <div class="stats-panel">
          <div class="stat-card">
            <span class="stat-label">CPM</span>
            <span class="stat-value" id="cpm">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">WPM</span>
            <span class="stat-value" id="wpm">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Accuracy</span>
            <span class="stat-value" id="accuracy">100</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Errors</span>
            <span class="stat-value" id="errors">0</span>
          </div>
        </div>
        <div class="text-container waiting" id="textContainer">
          <div class="text-display" id="textDisplay"></div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" id="startBtn">Начать тест</button>
          <button class="btn btn-secondary" id="resetBtn">Сброс</button>
        </div>
      </div>
    `;
  }

  initTextDisplay() {
    this.textDisplay.setContainer();
    return this.textDisplay;
  }

  initControls() {
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    if (startBtn && this.startCallback) {
      startBtn.addEventListener("click", this.startCallback);
    }
    if (resetBtn && this.resetCallback) {
      resetBtn.addEventListener("click", this.resetCallback);
    }
  }

  updateStats(stats) {
    this.stats = { ...this.stats, ...stats };
    this.renderStats();
  }

  renderStats() {
    this.updateElement("cpm", Math.round(this.stats.cpm || 0));
    this.updateElement("wpm", Math.round(this.stats.wpm || 0));
    this.updateElement("accuracy", Math.round(this.stats.accuracy || 100));
    this.updateElement("errors", Math.round(this.stats.errors || 0));
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.updateDifficultyButtons();
  }

  updateDifficultyButtons() {
    const buttons = document.querySelectorAll(".difficulty-btn");
    buttons.forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.difficulty === this.difficulty,
      );
    });
  }

  setGameState(state) {
    const container = document.getElementById("textContainer");
    if (!container) return;
    container.classList.remove("waiting", "active", "completing");
    if (state) {
      container.classList.add(state);
    }
  }

  setControlsEnabled(enabled) {
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    if (startBtn) {
      startBtn.disabled = !enabled;
      startBtn.style.opacity = enabled ? "1" : "0.5";
      startBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }
    if (resetBtn) {
      resetBtn.disabled = !enabled;
      resetBtn.style.opacity = enabled ? "1" : "0.5";
      resetBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }
  }

  attachDifficultyListeners(callback) {
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const difficulty = btn.dataset.difficulty;
        this.setDifficulty(difficulty);
        callback(difficulty);
      });
    });
  }

  attachStartListener(callback) {
    this.startCallback = callback;
    const startBtn = document.getElementById("startBtn");
    if (startBtn) {
      startBtn.addEventListener("click", callback);
    }
  }

  attachResetListener(callback) {
    this.resetCallback = callback;
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", callback);
    }
  }

  removeBlur() {
    const container = document.getElementById("textContainer");
    if (container) {
      container.classList.remove("waiting", "completing");
      container.classList.add("active");
    }
  }
}
