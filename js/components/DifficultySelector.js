export class DifficultySelector {
  constructor(currentDifficulty = "medium") {
    this.currentDifficulty = currentDifficulty;
  }

  render() {
    return `
    <div class="difficulty-selector">
    <button class="difficulty-btn ${this.currentDifficulty === "easy" ? "active" : ""}" data-difficulty="easy">Лёгкий</button>
    <button class="difficulty-btn ${this.currentDifficulty === "medium" ? "active" : ""}" data-difficulty="medium">Средний</button>
    <button class="difficulty-btn ${this.currentDifficulty === "hard" ? "active" : ""}" data-difficulty="hard">Сложный</button>
    </div>
    `;
  }
}
