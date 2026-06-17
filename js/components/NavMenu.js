export class NavMenu {
  constructor(activePage = "train") {
    this.activePage = activePage;
  }

  render() {
    return `
    <nav class="nav-menu">
    <button class="nav-btn ${this.activePage === "train" ? "active" : ""}" data-page="train">⌨️ Тренажёр</button>
    <button class="nav-btn ${this.activePage === "lessons" ? "active" : ""}" data-page="lessons">📚 Уроки</button>
    <button class="nav-btn ${this.activePage === "stats" ? "active" : ""}" data-page="stats">📊 Статистика</button>
    </nav>
    `;
  }
}
