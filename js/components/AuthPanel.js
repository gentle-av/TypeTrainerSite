export class AuthPanel {
  render(isLoggedIn = false, username = "") {
    return `
    <div class="auth-panel">
    <div class="user-info-panel">
    <span id="userName">${isLoggedIn ? `✓ ${username}` : "❌ Не авторизован"}</span>
    </div>
    <button id="authBtn" class="auth-btn" ${isLoggedIn ? 'style="display:none"' : ""}>🔐 Войти</button>
    <button id="logoutBtn" class="logout-btn" ${!isLoggedIn ? 'style="display:none"' : ""}>🚪 Выйти</button>
    </div>
    `;
  }
}
