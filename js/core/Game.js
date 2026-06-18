import { KeyboardHandler } from "./KeyboardHandler.js";

export class Game {
  constructor(api, notification, pageBuilder, gameEngine) {
    this.api = api;
    this.notification = notification;
    this.pageBuilder = pageBuilder;
    this.gameEngine = gameEngine;
    this.keyboard = new KeyboardHandler();
    this.difficulty = "medium";
    this.isLessonMode = false;
    this.keydownHandler = null;
    this.enterHandler = null;
    this.isKeydownRegistered = false;
    this.onStart = null;
    this.onEnd = null;
    this.onReset = null;
    this.setupKeyboardHandlers();
    if (this.gameEngine) {
      this.gameEngine.onStatsUpdate = (stats) => this.updateStats(stats);
    }
  }

  setLessonMode(enabled) {
    this.isLessonMode = enabled;
  }

  loadText(text) {
    if (!text || typeof text !== "string") {
      console.error("Invalid text provided");
      this.notification?.error("Ошибка загрузки текста");
      return;
    }
    const words = text.split(" ");
    if (this.gameEngine) {
      this.gameEngine.loadText(words);
    }
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.updateStats({ cpm: 0, wpm: 0, accuracy: 100, errors: 0 });
    }
  }

  setupKeyboardHandlers() {
    this.keyboard.register(" ", (e) => this.handleSpace(e));
    this.keyboard.register("Backspace", (e) => this.handleBackspace(e));
  }

  handleEnter(e) {
    const authModal = document.getElementById("authModal");
    if (authModal && authModal.style.display === "block") {
      return;
    }
    e.preventDefault();
    if (!this.gameEngine?.isActive()) {
      this.start();
    }
  }

  handleKeyPress(e) {
    const authModal = document.getElementById("authModal");
    if (authModal && authModal.style.display === "block") {
      return;
    }
    if (!this.gameEngine?.isActive()) return;
    if (e.key === " " || e.key === "Backspace" || e.key === "Enter") return;
    if (e.key.length === 1) {
      e.preventDefault();
      this.handleChar(e.key);
    }
  }

  async init() {
    await this.loadRandomText();
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.updateStats({ cpm: 0, wpm: 0, accuracy: 100, errors: 0 });
    }
    if (this.enterHandler) {
      document.removeEventListener("keydown", this.enterHandler);
    }
    this.enterHandler = (e) => {
      if (e.key === "Enter" && !this.gameEngine?.isActive()) {
        this.handleEnter(e);
      }
    };
    document.addEventListener("keydown", this.enterHandler);
  }

  async loadRandomText() {
    try {
      const data = await this.api.getRandomText(this.difficulty);
      if (data && data.text) {
        this.loadText(data.text);
      } else {
        throw new Error("No text in response");
      }
    } catch (error) {
      console.error("Error loading text:", error);
      this.notification.error("Ошибка загрузки текста");
      const fallbackText = "Быстрая печать это важный навык в современном мире";
      this.loadText(fallbackText);
    }
  }

  start() {
    if (this.gameEngine?.isActive()) return;
    this.gameEngine?.start();
    this.keyboard.activate();
    this.keyboard.focus();
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
      this.isKeydownRegistered = false;
    }
    if (!this.isKeydownRegistered) {
      this.keydownHandler = (e) => this.handleKeyPress(e);
      document.addEventListener("keydown", this.keydownHandler);
      this.isKeydownRegistered = true;
    }
    this.notification.info("Тест начат!");
    if (this.onStart) this.onStart();
  }

  updateStats(stats) {
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.updateStats({
        cpm: stats.cpm || 0,
        wpm: stats.wpm || 0,
        accuracy: stats.accuracy || 100,
        errors: stats.errors || 0,
      });
    }
  }

  handleSpace(e) {
    e.preventDefault();
    const result = this.gameEngine?.handleSpace();
    if (result) {
      this.updateDisplay();
      if (result.isComplete) {
        this.end();
      }
    }
  }

  handleBackspace(e) {
    e.preventDefault();
    const result = this.gameEngine?.handleBackspace();
    if (result) {
      this.updateDisplay();
    }
  }

  handleChar(char) {
    const result = this.gameEngine?.handleChar(char);
    if (result) {
      this.updateDisplay();
      if (result.isComplete) {
        this.end();
      }
    }
  }

  updateDisplay() {
    const progress = this.gameEngine?.getProgress();
    if (!progress) return;
    const textDisplayEl = document.getElementById("textDisplay");
    if (textDisplayEl && this.gameEngine) {
      const trainPage = this.pageBuilder.getPageInstance("train");
      if (trainPage && trainPage.textDisplay) {
        trainPage.textDisplay.updateProgress(
          progress.wordIndex,
          progress.charIndex,
          this.gameEngine.currentInput,
        );
      }
    }
  }

  async end() {
    if (!this.gameEngine?.isActive()) return;
    const stats = this.gameEngine.end();
    if (!stats) return;
    this.keyboard.deactivate();
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
      this.isKeydownRegistered = false;
    }
    await this.api.saveTestResult(
      stats.totalChars || 0,
      stats.errors || 0,
      Math.round(stats.timeSeconds || 0),
    );
    const statsPage = this.pageBuilder.getPageInstance("stats");
    if (statsPage) {
      await statsPage.loadLeaderboard?.();
      await statsPage.loadUserStats?.();
    }
    this.notification.success(
      `Тест завершён! CPM: ${Math.round(stats.cpm || 0)}`,
    );
    if (this.onEnd) this.onEnd();
  }

  reset() {
    if (this.gameEngine?.isActive()) {
      this.gameEngine.end();
      this.keyboard.deactivate();
      if (this.keydownHandler) {
        document.removeEventListener("keydown", this.keydownHandler);
        this.keydownHandler = null;
        this.isKeydownRegistered = false;
      }
    }
    if (this.isLessonMode) {
      this.loadText(this.gameEngine?.currentWords?.join(" ") || "");
    } else {
      this.loadRandomText();
    }
    this.gameEngine?.resetProgress();
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.updateStats({ cpm: 0, wpm: 0, accuracy: 100, errors: 0 });
    }
    if (this.onReset) this.onReset();
  }

  setOnStart(callback) {
    this.onStart = callback;
  }

  setOnEnd(callback) {
    this.onEnd = callback;
  }

  setOnReset(callback) {
    this.onReset = callback;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.reset();
  }

  async loadNewText() {
    if (this.isLessonMode) {
      this.loadText(this.gameEngine?.currentWords?.join(" ") || "");
      return;
    }
    await this.loadRandomText();
    this.gameEngine?.resetProgress();
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.updateStats({ cpm: 0, wpm: 0, accuracy: 100, errors: 0 });
    }
  }

  calculateCPM() {
    return this.gameEngine?.calculateCPM() || 0;
  }

  calculateAccuracy() {
    return this.gameEngine?.calculateAccuracy() || 100;
  }
}
