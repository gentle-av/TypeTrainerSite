class NavigationManager {
  constructor(pageBuilder, tabManager, auth) {
    this.pageBuilder = pageBuilder;
    this.tabManager = tabManager;
    this.auth = auth;
    this.currentPage = "train";
  }

  init() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.navigateTo(btn.dataset.page));
    });
  }

  navigateTo(page) {
    this.currentPage = page;
    this.pageBuilder.showPage(page);
    this.updateSidebar(page);
    this.saveCurrentTab(page);
    this.triggerPageChange(page);
  }

  updateSidebar(page) {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === page);
    });
  }

  saveCurrentTab(page) {
    if (this.auth.isLoggedIn) {
      this.tabManager.saveTab(page);
    }
  }

  triggerPageChange(page) {
    window.dispatchEvent(
      new CustomEvent("pageChanged", {
        detail: { page },
      }),
    );
  }

  getCurrentPage() {
    return this.currentPage;
  }
}

export { NavigationManager };
