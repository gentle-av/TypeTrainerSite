export class PageEventBinder {
  constructor(eventManager, pageBuilder) {
    this.eventManager = eventManager;
    this.pageBuilder = pageBuilder;
  }

  bindAll() {
    this.bindNavigation();
    this.bindAuth();
    this.bindGameControls();
    this.bindHistoryControls();
    this.bindGlobalEvents();
  }

  bindNavigation() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      this.eventManager.addDomListener(btn, "click", () => {
        const page = btn.dataset.page;
        this.eventManager.emit("navigate", { page });
      });
    });
  }

  bindAuth() {
    const authBtn = document.getElementById("authBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (authBtn) {
      this.eventManager.addDomListener(authBtn, "click", () => {
        this.eventManager.emit("auth:open");
      });
    }

    if (logoutBtn) {
      this.eventManager.addDomListener(logoutBtn, "click", () => {
        this.eventManager.emit("auth:logout");
      });
    }
  }

  bindGameControls() {
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (startBtn) {
      this.eventManager.addDomListener(startBtn, "click", () => {
        this.eventManager.emit("game:start");
      });
    }

    if (resetBtn) {
      this.eventManager.addDomListener(resetBtn, "click", () => {
        this.eventManager.emit("game:reset");
      });
    }

    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      this.eventManager.addDomListener(btn, "click", () => {
        const difficulty = btn.dataset.difficulty;
        document.querySelectorAll(".difficulty-btn").forEach((b) => {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        this.eventManager.emit("game:difficulty", { difficulty });
      });
    });
  }

  bindHistoryControls() {
    const clearBtn = document.getElementById("clearHistoryBtn");
    if (clearBtn) {
      this.eventManager.addDomListener(clearBtn, "click", () => {
        this.eventManager.emit("history:clear");
      });
    }
  }

  bindGlobalEvents() {
    this.eventManager.addWindowListener("navigateTo", (e) => {
      this.eventManager.emit("navigate", e.detail);
    });

    this.eventManager.addWindowListener("pageChanged", (e) => {
      this.eventManager.emit("page:changed", e.detail);
    });

    this.eventManager.addWindowListener("lessonStarted", (e) => {
      this.eventManager.emit("lesson:start", e.detail);
    });
  }
}
