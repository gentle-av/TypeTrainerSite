class NavigationEventHandler {
  constructor(eventManager, pageBuilder, tabManager, authManager) {
    this.eventManager = eventManager;
    this.pageBuilder = pageBuilder;
    this.tabManager = tabManager;
    this.authManager = authManager;
  }

  init() {
    this.eventManager.on("navigate", this.handleNavigate.bind(this));
    this.eventManager.on("page:changed", this.handlePageChanged.bind(this));
  }

  handleNavigate(data) {
    const page = data.page;
    if (page === "stats" && !this.authManager.isLoggedIn()) {
      this.eventManager.emit("auth:open");
      return;
    }
    this.pageBuilder.showPage(page);
    this.updateSidebar(page);
    this.saveTab(page);
  }

  handlePageChanged(data) {
    const page = data.page;
    if (page === "stats") {
      this.eventManager.emit("stats:load");
    }
    if (page === "lessons") {
      this.eventManager.emit("lessons:load");
    }
  }

  updateSidebar(page) {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === page);
    });
  }

  saveTab(page) {
    if (this.authManager.isLoggedIn()) {
      this.tabManager.saveTab(page);
    }
  }

  async restoreTab() {
    if (this.authManager.isLoggedIn()) {
      const savedTab = await this.tabManager.restoreTab();
      if (savedTab) {
        this.eventManager.emit("navigate", { page: savedTab });
        return true;
      }
    }
    return false;
  }
}

export { NavigationEventHandler };
