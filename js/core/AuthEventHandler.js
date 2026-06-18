class AuthEventHandler {
  constructor(eventManager, auth, sidebar, controlManager) {
    this.eventManager = eventManager;
    this.auth = auth;
    this.sidebar = sidebar;
    this.controlManager = controlManager;
  }

  init() {
    this.eventManager.on("auth:open", this.handleOpen.bind(this));
    this.eventManager.on("auth:logout", this.handleLogout.bind(this));
    this.auth.setOnLogin(() => this.handleLogin());
    this.auth.setOnLogout(() => this.handleLogout());
  }

  handleOpen() {
    this.auth.open();
  }

  handleLogin() {
    this.sidebar.updateAuth(true, this.auth.currentUser?.login);
    this.controlManager.enable();
    this.eventManager.emit("user:logged_in");
  }

  handleLogout() {
    this.sidebar.updateAuth(false, "");
    this.controlManager.disable();
    this.eventManager.emit("user:logged_out");
  }

  isLoggedIn() {
    return this.auth.isLoggedIn;
  }
}

export { AuthEventHandler };
