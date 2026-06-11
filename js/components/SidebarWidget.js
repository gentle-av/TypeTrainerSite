import { Header } from "./Header.js";
import { AuthPanel } from "./AuthPanel.js";
import { DifficultySelector } from "./DifficultySelector.js";
import { NavMenu } from "./NavMenu.js";
import { LeaderboardWidget } from "./LeaderboardWidget.js";

export class Sidebar {
  constructor() {
    this.header = new Header();
    this.authPanel = new AuthPanel();
    this.difficultySelector = new DifficultySelector();
    this.navMenu = new NavMenu();
    this.leaderboardWidget = new LeaderboardWidget();
  }
  render() {
    return `
    ${this.header.render()}
    ${this.authPanel.render()}
    ${this.difficultySelector.render()}
    ${this.navMenu.render()}
    ${this.leaderboardWidget.render()}
    `;
  }
  updateAuth(isLoggedIn, username) {
    const authPanel = document.querySelector(".auth-panel");
    if (authPanel) {
      const userNameSpan = document.getElementById("userName");
      const authBtn = document.getElementById("authBtn");
      const logoutBtn = document.getElementById("logoutBtn");
      if (userNameSpan)
        userNameSpan.textContent = isLoggedIn
          ? `✓ ${username}`
          : "❌ Не авторизован";
      if (authBtn) authBtn.style.display = isLoggedIn ? "none" : "block";
      if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "block" : "none";
    }
  }
  updateDifficulty(difficulty) {
    const btns = document.querySelectorAll(".difficulty-btn");
    btns.forEach((btn) => {
      if (btn.dataset.difficulty === difficulty) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  updateNav(activePage) {
    const btns = document.querySelectorAll(".nav-btn");
    btns.forEach((btn) => {
      if (btn.dataset.page === activePage) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
}
