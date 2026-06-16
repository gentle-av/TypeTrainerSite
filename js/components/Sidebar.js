import { Header } from "./Header.js";
import { AuthPanel } from "./AuthPanel.js";
import { NavMenu } from "./NavMenu.js";

export class Sidebar {
  constructor() {
    this.header = new Header();
    this.authPanel = new AuthPanel();
    this.navMenu = new NavMenu();
  }

  render() {
    return `
      ${this.header.render()}
      ${this.authPanel.render()}
      ${this.navMenu.render()}
    `;
  }

  updateAuth(isLoggedIn, username) {
    const userNameSpan = document.getElementById("userName");
    const authBtn = document.getElementById("authBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    if (userNameSpan) {
      userNameSpan.textContent = isLoggedIn
        ? `✓ ${username || "В системе"}`
        : "❌ Не авторизован";
    }
    if (authBtn) {
      authBtn.style.display = isLoggedIn ? "none" : "block";
    }
    if (logoutBtn) {
      logoutBtn.style.display = isLoggedIn ? "block" : "none";
    }
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
