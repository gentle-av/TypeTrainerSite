export class Auth {
  constructor(api, notification) {
    this.api = api;
    this.notification = notification;
    this.isLoggedIn = false;
    this.currentUser = null;
    this.game = null;
    this.onLoginCallback = null;
    this.onLogoutCallback = null;
    this.sessionChecked = false;
    this.modal = null;
  }

  setGame(game) {
    this.game = game;
  }

  setOnLogin(callback) {
    this.onLoginCallback = callback;
  }

  setOnLogout(callback) {
    this.onLogoutCallback = callback;
  }

  async checkSession() {
    if (this.sessionChecked) return;
    try {
      const user = await this.api.get("/api/user/current");
      if (user && user.success) {
        this.isLoggedIn = true;
        this.currentUser = { id: user.user_id };
        this.onLoginCallback?.();
      } else {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.onLogoutCallback?.();
      }
    } catch (error) {
      console.error("Session check failed:", error);
      this.isLoggedIn = false;
      this.currentUser = null;
    }
    this.sessionChecked = true;
  }

  closeModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  open() {
    if (this.modal) {
      this.closeModal();
    }
    const modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.innerHTML = `
      <div class="auth-modal-content">
        <div class="auth-modal-header">
          <h2>Авторизация</h2>
          <button class="auth-modal-close">&times;</button>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Вход</button>
          <button class="auth-tab" data-tab="register">Регистрация</button>
        </div>
        <div class="auth-forms">
          <form id="loginForm" class="auth-form active">
            <input type="text" id="loginUsername" placeholder="Логин" required>
            <input type="password" id="loginPassword" placeholder="Пароль" required>
            <button type="submit">Войти</button>
          </form>
          <form id="registerForm" class="auth-form">
            <input type="text" id="registerUsername" placeholder="Имя пользователя" required>
            <input type="text" id="registerLogin" placeholder="Логин" required>
            <input type="email" id="registerEmail" placeholder="Email" required>
            <input type="password" id="registerPassword" placeholder="Пароль" required>
            <button type="submit">Зарегистрироваться</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.modal = modal;
    modal
      .querySelector(".auth-modal-close")
      .addEventListener("click", () => this.closeModal());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });
    const tabs = modal.querySelectorAll(".auth-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const formId =
          tab.dataset.tab === "login" ? "loginForm" : "registerForm";
        modal
          .querySelectorAll(".auth-form")
          .forEach((f) => f.classList.remove("active"));
        modal.querySelector(`#${formId}`).classList.add("active");
      });
    });
    const loginForm = modal.querySelector("#loginForm");
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const login = modal.querySelector("#loginUsername").value;
      const password = modal.querySelector("#loginPassword").value;
      const success = await this.login(login, password);
      if (success) {
        this.closeModal();
      }
    });
    const registerForm = modal.querySelector("#registerForm");
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = modal.querySelector("#registerUsername").value;
      const login = modal.querySelector("#registerLogin").value;
      const email = modal.querySelector("#registerEmail").value;
      const password = modal.querySelector("#registerPassword").value;
      const success = await this.register(username, login, email, password);
      if (success) {
        this.closeModal();
      }
    });
  }

  async login(login, password) {
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.isLoggedIn = true;
          this.currentUser = { id: data.user_id };
          localStorage.setItem("user_id", data.user_id);
          this.sessionChecked = true;
          this.onLoginCallback?.();
          this.notification.success("Добро пожаловать!");
          return true;
        }
      }
      const data = await response.json();
      this.notification.error(data.error || "Ошибка входа");
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      this.notification.error("Ошибка входа");
      return false;
    }
  }

  async register(username, login, email, password) {
    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, login, email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.notification.success("Регистрация успешна! Теперь войдите.");
          return true;
        }
      }
      const data = await response.json();
      this.notification.error(data.error || "Ошибка регистрации");
      return false;
    } catch (error) {
      console.error("Register failed:", error);
      this.notification.error("Ошибка регистрации");
      return false;
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem("user_id");
    this.sessionChecked = false;
    this.closeModal();
    this.onLogoutCallback?.();
    this.notification.info("Вы вышли из системы");
  }
}
