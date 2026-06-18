import { Api } from "./core/Api.js";
import { Notification } from "./components/Notification.js";
import { Leaderboard } from "./components/Leaderboard.js";
import { History } from "./components/History.js";
import { Auth } from "./components/Auth.js";
import { AdminPanel } from "./components/Admin.js";
import { Sidebar } from "./components/Sidebar.js";
import { Stats } from "./components/Stats.js";
import { TextDisplay } from "./components/TextDisplay.js";
import { Game } from "./core/Game.js";
import { PageBuilder } from "./core/PageBuilder.js";
import { ControlManager } from "./core/ControlManager.js";
import { TabManager } from "./core/TabManager.js";
import { EventManager } from "./core/EventManager.js";
import { PageEventBinder } from "./core/PageEventBinder.js";
import { GameEventHandler } from "./core/GameEventHandler.js";
import { AuthEventHandler } from "./core/AuthEventHandler.js";
import { NavigationEventHandler } from "./core/NavigationEventHandler.js";
import { LessonEventHandler } from "./core/LessonEventHandler.js";
import { StatsEventHandler } from "./core/StatsEventHandler.js";
import { HistoryEventHandler } from "./core/HistoryEventHandler.js";
import { LessonManager } from "./core/LessonManager.js";
import { StatsManager } from "./core/StatsManager.js";
import { AuthManager } from "./core/AuthManager.js";

class App {
  constructor() {
    this.eventManager = new EventManager();
    this.api = new Api();
    this.notification = new Notification();
    this.leaderboard = new Leaderboard(this.api);
    this.history = new History(this.api);
    this.auth = new Auth(this.api, this.notification);
    this.sidebar = new Sidebar();
    this.pageBuilder = new PageBuilder();
    this.controlManager = new ControlManager();
    this.tabManager = new TabManager(this.api);
    this.lessonManager = new LessonManager(
      this.api,
      this.notification,
      this.pageBuilder,
    );
    this.statsManager = new StatsManager(this.api, this.pageBuilder);
    this.authManager = new AuthManager(
      this.auth,
      this.sidebar,
      this.controlManager,
    );
    this.game = new Game(
      this.api,
      this.notification,
      this.leaderboard,
      this.history,
      new Stats(),
      new TextDisplay(),
    );
    this.gameEventHandler = new GameEventHandler(
      this.eventManager,
      this.game,
      this.lessonManager,
      this.authManager,
      this.notification,
      this.pageBuilder,
    );
    this.authEventHandler = new AuthEventHandler(
      this.eventManager,
      this.auth,
      this.sidebar,
      this.controlManager,
    );
    this.navigationEventHandler = new NavigationEventHandler(
      this.eventManager,
      this.pageBuilder,
      this.tabManager,
      this.authManager,
    );
    this.lessonEventHandler = new LessonEventHandler(
      this.eventManager,
      this.lessonManager,
    );
    this.statsEventHandler = new StatsEventHandler(
      this.eventManager,
      this.statsManager,
    );
    this.historyEventHandler = new HistoryEventHandler(
      this.eventManager,
      this.leaderboard,
      this.history,
      this.authManager,
      this.notification,
    );
    this.pageEventBinder = new PageEventBinder(
      this.eventManager,
      this.pageBuilder,
    );
    this.adminPanel = new AdminPanel(this.api);
  }

  async init() {
    this.buildUI();
    this.controlManager.init();
    await this.game.init();
    this.authManager.init();
    this.gameEventHandler.init();
    this.authEventHandler.init();
    this.navigationEventHandler.init();
    this.lessonEventHandler.init();
    this.statsEventHandler.init();
    this.historyEventHandler.init();
    this.pageEventBinder.bindAll();
    await this.authManager.checkSession();
    await this.navigationEventHandler.restoreTab();
    await this.loadInitialData();
    this.applyAuthState();
  }

  buildUI() {
    const sidebarContainer = document.getElementById("sidebar");
    const mainContainer = document.getElementById("main-content");
    if (sidebarContainer) {
      sidebarContainer.innerHTML = this.sidebar.render();
    }
    if (mainContainer) {
      mainContainer.innerHTML = this.pageBuilder.buildMainContent();
    }
  }

  async loadInitialData() {
    await this.lessonManager.loadLessons();
    if (this.authManager.isLoggedIn()) {
      await this.lessonManager.loadProgress();
      await this.statsManager.loadUserStats();
      await this.statsManager.loadLeaderboard();
    }
  }

  applyAuthState() {
    if (!this.authManager.isLoggedIn()) {
      this.controlManager.disable();
    } else {
      this.controlManager.enable();
    }
  }

  destroy() {
    this.eventManager.clear();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App();
  await app.init();
  window.app = app;
  window.adminPanel = app.adminPanel;
  window.loadUserStats = () => app.statsManager.loadUserStats();
  window.loadLessons = () => app.lessonManager.loadLessons();
});

export { App };
