export class Auth {
  constructor(api, notification) {
    this.api = api;
    this.notification = notification;
    this.isLoggedIn = false;
    this.currentUser = null;
    this.setupModal();
    this.checkSession();
  }

  setupModal() {
    const modalHtml = `
    <div id="authModal" class="modal">
    <div class="modal-content">
    <div class="modal-header">
    <h2>🔐 Авторизация</h2>
    <span class="close">&times;</span>
    </div>
    <div class="modal-body">
    <div id="authTabs">
    <button class="tab-btn active" data-tab="login">Вход</button>
    <button class="tab-btn" data-tab="register">Регистрация</button>
    </div>
    <div id="loginForm" class="auth-form active">
    <input type="text" id="loginLogin" placeholder="Логин (email)" autocomplete="username">
    <input type="password" id="loginPassword" placeholder="Пароль" autocomplete="current-password">
    <button id="doLoginBtn" class="btn-auth">➡ Войти</button>
    </div>
    <div id="registerForm" class="auth-form">
    <input type="text" id="regUsername" placeholder="Имя пользователя">
    <input type="text" id="regLogin" placeholder="Логин (email)">
    <input type="password" id="regPassword" placeholder="Пароль">
    <input type="password" id="regPasswordConfirm" placeholder="Подтверждение пароля">
    <button id="doRegisterBtn" class="btn-auth">📝 Зарегистрироваться</button>
    </div>
    </div>
    </div>
    </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    this.modal = document.getElementById("authModal");
    this.setupEventListeners();
  }

  setupEventListeners() {
    const closeBtn = this.modal?.querySelector(".close");
    closeBtn?.addEventListener("click", () => this.close());
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
    const tabs = this.modal?.querySelectorAll(".tab-btn");
    tabs?.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.dataset.tab;
        document
          .getElementById("loginForm")
          ?.classList.toggle("active", tab === "login");
        document
          .getElementById("registerForm")
          ?.classList.toggle("active", tab === "register");
      });
    });
    const doLoginBtn = document.getElementById("doLoginBtn");
    const doRegisterBtn = document.getElementById("doRegisterBtn");
    if (doLoginBtn) {
      doLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.login();
      });
    }
    if (doRegisterBtn) {
      doRegisterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.register();
      });
    }
    const loginPassword = document.getElementById("loginPassword");
    const loginLogin = document.getElementById("loginLogin");
    const regPassword = document.getElementById("regPassword");
    const regPasswordConfirm = document.getElementById("regPasswordConfirm");
    if (loginPassword) {
      loginPassword.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          this.login();
        }
      });
    }
    if (loginLogin) {
      loginLogin.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          if (loginPassword.value) {
            this.login();
          } else {
            loginPassword.focus();
          }
        }
      });
    }
    if (regPasswordConfirm) {
      regPasswordConfirm.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          this.register();
        }
      });
    }
    if (regPassword) {
      regPassword.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          regPasswordConfirm.focus();
        }
      });
    }
  }

  open() {
    this.modal.style.display = "block";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      document.getElementById("loginLogin")?.focus();
    }, 100);
  }

  close() {
    this.modal.style.display = "none";
    document.body.style.overflow = "";
  }

  async checkSession() {
    console.log("Checking session...");
    const userId = localStorage.getItem("user_id");
    console.log("User ID from localStorage:", userId);
    if (userId) {
      this.isLoggedIn = true;
      this.currentUser = { login: "alexey" };
      console.log("Session restored from localStorage");
      this.onLoginCallback?.();
      return true;
    }
    try {
      const response = await fetch("/api/user/current", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        this.isLoggedIn = true;
        this.currentUser = { login: data.login };
        localStorage.setItem("user_id", data.user_id);
        this.onLoginCallback?.();
        return true;
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
    this.isLoggedIn = false;
    return false;
  }

  async login() {
    const login = document.getElementById("loginLogin")?.value;
    const password = document.getElementById("loginPassword")?.value;
    if (!login || !password) {
      this.notification.error("Введите логин и пароль");
      return;
    }
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("user_id", data.user_id);
        console.log("Saved user_id to localStorage:", data.user_id);
        this.isLoggedIn = true;
        this.currentUser = { login };
        this.onLoginCallback?.();
        this.notification.success("Вы вошли в систему");
        this.close();
      } else {
        this.notification.error(data.error || "Ошибка входа");
      }
      return data;
    } catch (error) {
      this.notification.error("Ошибка соединения");
      return { success: false };
    }
  }

  async register() {
    const username = document.getElementById("regUsername")?.value;
    const login = document.getElementById("regLogin")?.value;
    const password = document.getElementById("regPassword")?.value;
    const confirm = document.getElementById("regPasswordConfirm")?.value;
    if (!username || !login || !password || !confirm) {
      this.notification.error("Заполните все поля");
      return;
    }
    if (password !== confirm) {
      this.notification.error("Пароли не совпадают");
      return;
    }
    try {
      const response = await this.api.post("/api/user/register", {
        username,
        login,
        password,
      });
      if (response.success) {
        this.notification.success("Регистрация успешна, теперь войдите");
        const tabs = this.modal?.querySelectorAll(".tab-btn");
        tabs?.forEach((b) => b.classList.remove("active"));
        tabs?.[0]?.classList.add("active");
        document.getElementById("loginForm")?.classList.add("active");
        document.getElementById("registerForm")?.classList.remove("active");
        document.getElementById("loginLogin").value = login;
        document.getElementById("loginPassword").focus();
      } else {
        this.notification.error(response.error || "Ошибка регистрации");
      }
    } catch (error) {
      this.notification.error("Ошибка сервера");
    }
  }

  async logout() {
    try {
      await this.api.post("/api/user/logout", {});
    } catch (error) {
      console.log("Logout error:", error);
    }
    this.isLoggedIn = false;
    this.currentUser = null;
    this.notification.success("Вы вышли из системы");
    this.updateUI();
    if (this.onLogout) this.onLogout();
  }

  setOnLogin(callback) {
    this.onLogin = callback;
  }

  setOnLogout(callback) {
    this.onLogout = callback;
  }

  open() {
    this.modal.style.display = "block";
    document.getElementById("loginLogin")?.focus();
  }

  close() {
    this.modal.style.display = "none";
  }

  updateUI() {
    const authBtn = document.getElementById("authBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userNameSpan = document.getElementById("userName");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const difficultyBtns = document.querySelectorAll(".difficulty-btn");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    const adminBtn = document.getElementById("adminBtn");
    if (this.isLoggedIn) {
      document.body.classList.remove("auth-locked");
      if (authBtn) authBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (userNameSpan) userNameSpan.textContent = "✓ В системе";
      if (startBtn) startBtn.disabled = false;
      if (resetBtn) resetBtn.disabled = false;
      difficultyBtns.forEach((btn) => {
        if (btn) btn.disabled = false;
      });
      if (clearHistoryBtn) clearHistoryBtn.disabled = false;
      if (adminBtn) adminBtn.style.display = "block";
    } else {
      document.body.classList.add("auth-locked");
      if (authBtn) authBtn.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (userNameSpan) userNameSpan.textContent = "❌ Не авторизован";
      if (startBtn) startBtn.disabled = true;
      if (resetBtn) resetBtn.disabled = true;
      difficultyBtns.forEach((btn) => {
        if (btn) btn.disabled = true;
      });
      if (clearHistoryBtn) clearHistoryBtn.disabled = true;
      if (adminBtn) adminBtn.style.display = "none";
      if (this.activeGame && this.activeGame.active) {
        this.activeGame.end();
      }
    }
  }

  setGame(game) {
    this.activeGame = game;
  }
}
