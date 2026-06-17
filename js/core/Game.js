import { KeyboardHandler } from "./KeyboardHandler.js";

export class Game {
  constructor(api, notification, leaderboard, history, stats, textDisplay) {
    this.api = api;
    this.notification = notification;
    this.leaderboard = leaderboard;
    this.history = history;
    this.stats = stats;
    this.textDisplay = textDisplay;
    this.keyboard = new KeyboardHandler();
    this.active = false;
    this.startTime = null;
    this.currentWords = [];
    this.currentInput = "";
    this.totalErrors = 0;
    this.totalChars = 0;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.difficulty = "medium";
    this.isLessonMode = false;
    this.keydownHandler = null;
    this.enterHandler = null;
    this.isKeydownRegistered = false;
    this.errorPositions = new Set();
    this.setupKeyboardHandlers();
  }

  setLessonMode(enabled) {
    this.isLessonMode = enabled;
  }

  loadText(text) {
    if (!text) {
      console.error("No text provided");
      return;
    }
    this.currentWords = text.split(" ");
    this.textDisplay.setText(this.currentWords);
    this.resetProgress();
    this.stats.reset();
    this.textDisplay.render();
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
    if (!this.active) {
      this.start();
    }
  }

  handleKeyPress(e) {
    const authModal = document.getElementById("authModal");
    if (authModal && authModal.style.display === "block") {
      return;
    }
    if (!this.active) return;
    if (e.key === " " || e.key === "Backspace" || e.key === "Enter") return;
    if (e.key.length === 1) {
      e.preventDefault();
      this.handleChar(e.key);
    }
  }

  async init() {
    await this.loadRandomText();
    this.stats.reset();
    this.leaderboard.load();
    if (this.enterHandler) {
      document.removeEventListener("keydown", this.enterHandler);
    }
    this.enterHandler = (e) => {
      if (e.key === "Enter" && !this.active) {
        this.handleEnter(e);
      }
    };
    document.addEventListener("keydown", this.enterHandler);
  }

  async loadRandomText() {
    try {
      const data = await this.api.getRandomText(this.difficulty);
      if (data && data.text) {
        this.currentWords = data.text.split(" ");
        this.textDisplay.setText(this.currentWords);
        this.resetProgress();
      } else {
        throw new Error("No text in response");
      }
    } catch (error) {
      console.error("Error loading text:", error);
      this.notification.error("Ошибка загрузки текста");
      this.currentWords =
        "Быстрая печать это важный навык в современном мире".split(" ");
      this.textDisplay.setText(this.currentWords);
    }
  }

  resetProgress() {
    this.currentInput = "";
    this.totalErrors = 0;
    this.totalChars = 0;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.errorPositions.clear();
    this.textDisplay.updateProgress(0, 0, "");
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.startTime = Date.now();
    this.resetProgress();
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

  calculateCPM() {
    if (!this.startTime) return 0;
    const minutes = (Date.now() - this.startTime) / 60000;
    return minutes > 0 ? this.totalChars / minutes : 0;
  }

  calculateWPM() {
    return this.calculateCPM() / 5;
  }

  calculateAccuracy() {
    if (this.totalChars === 0) return 100;
    return ((this.totalChars - this.totalErrors) / this.totalChars) * 100;
  }

  updateStats() {
    const cpm = this.calculateCPM();
    const wpm = this.calculateWPM();
    const accuracy = this.calculateAccuracy();
    this.stats.update({
      cpm: cpm,
      wpm: wpm,
      accuracy: accuracy,
      errors: this.totalErrors,
    });
  }

  handleSpace(e) {
    e.preventDefault();
    const currentWord = this.currentWords[this.currentWordIndex];
    if (!currentWord) return;
    if (this.currentCharIndex === currentWord.length) {
      this.currentWordIndex++;
      this.currentCharIndex = 0;
      this.currentInput += " ";
      this.totalChars++;
      this.textDisplay.updateProgress(
        this.currentWordIndex,
        this.currentCharIndex,
        this.currentInput,
      );
      this.updateStats();
      this.checkTextComplete();
    } else {
      const position = this.getCurrentPosition();
      if (!this.errorPositions.has(position)) {
        this.errorPositions.add(position);
        this.totalErrors++;
      }
      this.currentCharIndex++;
      this.currentInput += " ";
      this.totalChars++;
      this.textDisplay.updateProgress(
        this.currentWordIndex,
        this.currentCharIndex,
        this.currentInput,
      );
      this.updateStats();
    }
  }

  getCurrentPosition() {
    let position = 0;
    for (let i = 0; i < this.currentWordIndex; i++) {
      position += this.currentWords[i].length + 1;
    }
    position += this.currentCharIndex;
    return position;
  }

  handleBackspace(e) {
    e.preventDefault();
    if (this.currentCharIndex > 0) {
      this.currentCharIndex--;
      this.currentInput = this.currentInput.slice(0, -1);
      this.totalChars--;
      this.textDisplay.updateProgress(
        this.currentWordIndex,
        this.currentCharIndex,
        this.currentInput,
      );
      this.updateStats();
    }
  }

  handleChar(char) {
    const currentWord = this.currentWords[this.currentWordIndex];
    if (!currentWord) return;
    if (this.currentCharIndex < currentWord.length) {
      const expectedChar = currentWord[this.currentCharIndex];
      const position = this.getCurrentPosition();
      this.currentInput += char;
      this.totalChars++;
      if (!this.isCharEqual(char, expectedChar)) {
        if (!this.errorPositions.has(position)) {
          this.errorPositions.add(position);
          this.totalErrors++;
        }
      }
      this.currentCharIndex++;
      this.textDisplay.updateProgress(
        this.currentWordIndex,
        this.currentCharIndex,
        this.currentInput,
      );
      this.updateStats();
      this.checkTextComplete();
    }
  }

  checkTextComplete() {
    if (this.currentWordIndex >= this.currentWords.length) {
      this.end();
      return;
    }
    const isLastWord = this.currentWordIndex === this.currentWords.length - 1;
    const currentWord = this.currentWords[this.currentWordIndex];
    const isLastChar = this.currentCharIndex === currentWord.length;
    if (isLastWord && isLastChar) {
      this.end();
    }
  }

  async end() {
    if (!this.active) return;
    this.active = false;
    this.keyboard.deactivate();
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
      this.isKeydownRegistered = false;
    }
    const timeSpent = (Date.now() - this.startTime) / 1000;
    await this.api.saveTestResult(
      this.totalChars,
      this.totalErrors,
      Math.round(timeSpent),
    );
    await this.leaderboard.load();
    await this.history.load();
    this.notification.success(
      `Тест завершён! CPM: ${Math.round(this.calculateCPM())}`,
    );
    if (this.onEnd) this.onEnd();
  }

  reset() {
    if (this.active) {
      this.active = false;
      this.keyboard.deactivate();
      if (this.keydownHandler) {
        document.removeEventListener("keydown", this.keydownHandler);
        this.keydownHandler = null;
        this.isKeydownRegistered = false;
      }
    }
    if (this.isLessonMode) {
      this.loadText(this.currentWords.join(" "));
    } else {
      this.loadRandomText();
    }
    this.stats.reset();
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
      this.loadText(this.currentWords.join(" "));
      return;
    }
    await this.loadRandomText();
    this.resetProgress();
    this.stats.reset();
    this.textDisplay.render();
  }

  normalizeChar(char) {
    if (char === "ё") return "е";
    if (char === "Ё") return "Е";
    if (char === "-" || char === "–" || char === "—") return "-";
    return char;
  }

  isCharEqual(char1, char2) {
    return this.normalizeChar(char1) === this.normalizeChar(char2);
  }
}
