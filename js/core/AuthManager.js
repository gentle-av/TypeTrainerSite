// core/AuthManager.js
export class AuthManager {
  constructor(auth, sidebar, controlManager) {
    this.auth = auth;
    this.sidebar = sidebar;
    this.controlManager = controlManager;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.auth.setOnLogin(() => this.onLogin());
    this.auth.setOnLogout(() => this.onLogout());
    this.initialized = true;
    console.log("AuthManager initialized");
  }

  onLogin() {
    console.log("AuthManager: onLogin called");
    this.sidebar.updateAuth(true, this.auth.currentUser?.login);
    this.controlManager.enable();
    window.dispatchEvent(new CustomEvent("userLoggedIn"));
  }

  onLogout() {
    console.log("AuthManager: onLogout called");
    this.sidebar.updateAuth(false, "");
    this.controlManager.disable();
    window.dispatchEvent(new CustomEvent("userLoggedOut"));
  }

  async checkSession() {
    console.log("AuthManager: checkSession called");
    await this.auth.checkSession();
  }

  openAuth() {
    this.auth.open();
  }

  logout() {
    this.auth.logout();
  }

  isLoggedIn() {
    return this.auth.isLoggedIn;
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}
