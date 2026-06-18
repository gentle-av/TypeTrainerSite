// core/GameEngine.js
export class GameEngine {
  constructor() {
    this.active = false;
    this.startTime = null;
    this.currentWords = [];
    this.currentInput = "";
    this.totalErrors = 0;
    this.totalChars = 0;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.errorPositions = new Set();
    this.onStatsUpdate = null;
  }

  loadText(words) {
    if (!words || !Array.isArray(words)) {
      throw new Error("Invalid words array");
    }
    this.currentWords = words;
    this.resetProgress();
  }

  resetProgress() {
    this.currentInput = "";
    this.totalErrors = 0;
    this.totalChars = 0;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.errorPositions.clear();
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.startTime = Date.now();
    this.resetProgress();
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

  getStats() {
    return {
      cpm: this.calculateCPM(),
      wpm: this.calculateWPM(),
      accuracy: this.calculateAccuracy(),
      errors: this.totalErrors,
      totalChars: this.totalChars,
      timeSeconds: this.startTime ? (Date.now() - this.startTime) / 1000 : 0,
    };
  }

  handleChar(char) {
    if (!this.active) return null;
    const currentWord = this.currentWords[this.currentWordIndex];
    if (!currentWord) return null;
    if (this.currentCharIndex < currentWord.length) {
      const expectedChar = currentWord[this.currentCharIndex];
      const position = this.getCurrentPosition();
      this.currentInput += char;
      this.totalChars++;
      const isError = !this.isCharEqual(char, expectedChar);
      if (isError && !this.errorPositions.has(position)) {
        this.errorPositions.add(position);
        this.totalErrors++;
      }
      this.currentCharIndex++;
      this.updateStats();
      return {
        isCorrect: !isError,
        isComplete: this.checkComplete(),
        position,
        expectedChar,
        actualChar: char,
      };
    }
    return null;
  }

  handleSpace() {
    if (!this.active) return null;
    const currentWord = this.currentWords[this.currentWordIndex];
    if (!currentWord) return null;
    if (this.currentCharIndex === currentWord.length) {
      this.currentWordIndex++;
      this.currentCharIndex = 0;
      this.currentInput += " ";
      this.totalChars++;
      this.updateStats();
      return { isComplete: this.checkComplete(), isWordComplete: true };
    } else {
      const position = this.getCurrentPosition();
      if (!this.errorPositions.has(position)) {
        this.errorPositions.add(position);
        this.totalErrors++;
      }
      this.currentCharIndex++;
      this.currentInput += " ";
      this.totalChars++;
      this.updateStats();
      return { isComplete: this.checkComplete(), isWordComplete: false };
    }
  }

  handleBackspace() {
    if (!this.active || this.currentCharIndex === 0) return null;
    this.currentCharIndex--;
    this.currentInput = this.currentInput.slice(0, -1);
    this.totalChars--;
    this.updateStats();
    return { charIndex: this.currentCharIndex };
  }

  getCurrentPosition() {
    let position = 0;
    for (let i = 0; i < this.currentWordIndex; i++) {
      position += this.currentWords[i].length + 1;
    }
    position += this.currentCharIndex;
    return position;
  }

  checkComplete() {
    const isLastWord = this.currentWordIndex >= this.currentWords.length - 1;
    const currentWord = this.currentWords[this.currentWordIndex];
    const isLastChar =
      currentWord && this.currentCharIndex === currentWord.length;
    return isLastWord && isLastChar;
  }

  updateStats() {
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.getStats());
    }
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

  end() {
    if (!this.active) return null;
    this.active = false;
    const stats = this.getStats();
    return stats;
  }

  isActive() {
    return this.active;
  }

  getCurrentWord() {
    return this.currentWords[this.currentWordIndex] || "";
  }

  getProgress() {
    return {
      wordIndex: this.currentWordIndex,
      charIndex: this.currentCharIndex,
      totalWords: this.currentWords.length,
      totalChars: this.currentInput.length,
    };
  }
}
