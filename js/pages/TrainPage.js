// js/pages/TrainPage.js
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
          <button class="btn btn-primary" id="startBtn" disabled>Начать тест</button>
          <button class="btn btn-secondary" id="resetBtn" disabled>Сброс</button>
        </div>
      </div>
    `;
  }

  initTextDisplay() {
    this.textDisplay.setContainer();
    return this.textDisplay;
  }

  updateStats(stats) {
    this.stats = { ...this.stats, ...stats };
    this.renderStats();
  }

  renderStats() {
    this.updateElement("cpm", this.stats.cpm || 0);
    this.updateElement("wpm", this.stats.wpm || 0);
    this.updateElement("accuracy", this.stats.accuracy || 100);
    this.updateElement("errors", this.stats.errors || 0);
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
    document.getElementById("startBtn")?.addEventListener("click", callback);
  }

  attachResetListener(callback) {
    document.getElementById("resetBtn")?.addEventListener("click", callback);
  }
}
