import { Api } from "./core/Api.js";
import { Notification } from "./components/Notification.js";
import { AuthService } from "./core/AuthService.js";
import { AuthEventHandler } from "./core/AuthEventHandler.js";
import { AdminPanel } from "./components/Admin.js";
import { Sidebar } from "./components/Sidebar.js";
import { PageBuilder } from "./core/PageBuilder.js";
import { ControlManager } from "./core/ControlManager.js";
import { TabManager } from "./core/TabManager.js";
import { EventManager } from "./core/EventManager.js";
import { PageEventBinder } from "./core/PageEventBinder.js";
import { GameEventHandler } from "./core/GameEventHandler.js";
import { NavigationEventHandler } from "./core/NavigationEventHandler.js";
import { LessonEventHandler } from "./core/LessonEventHandler.js";
import { StatsEventHandler } from "./core/StatsEventHandler.js";
import { HistoryEventHandler } from "./core/HistoryEventHandler.js";
import { LessonManager } from "./core/LessonManager.js";
import { StatsManager } from "./core/StatsManager.js";
import { AuthManager } from "./core/AuthManager.js";
import { DependencyContainer } from "./core/DependencyContainer.js";
import { Game } from "./core/Game.js";
import { GameEngine } from "./core/GameEngine.js";

class App {
  constructor() {
    this.container = new DependencyContainer();
    this.registerServices();
  }

  registerServices() {
    this.container.register("eventManager", () => new EventManager());
    this.container.register("api", () => new Api());
    this.container.register("notification", () => new Notification());
    this.container.register("sidebar", () => new Sidebar());
    this.container.register("pageBuilder", () => new PageBuilder());
    this.container.register("controlManager", () => new ControlManager());
    this.container.register(
      "tabManager",
      (c) => new TabManager(c.resolve("api")),
    );
    this.container.register(
      "statsManager",
      (c) => new StatsManager(c.resolve("api"), c.resolve("pageBuilder")),
    );
    this.container.register(
      "authManager",
      (c) =>
        new AuthManager(
          c.resolve("auth"),
          c.resolve("sidebar"),
          c.resolve("controlManager"),
        ),
    );
    this.container.register(
      "lessonManager",
      (c) =>
        new LessonManager(
          c.resolve("api"),
          c.resolve("notification"),
          c.resolve("pageBuilder"),
        ),
    );
    this.container.register(
      "auth",
      (c) => new AuthService(c.resolve("api"), c.resolve("notification")),
    );
    this.container.register("gameEngine", () => new GameEngine());
    this.container.register("game", (c) => {
      const api = c.resolve("api");
      const notification = c.resolve("notification");
      const pageBuilder = c.resolve("pageBuilder");
      const gameEngine = c.resolve("gameEngine");
      return new Game(api, notification, pageBuilder, gameEngine);
    });
    this.container.register(
      "gameEventHandler",
      (c) =>
        new GameEventHandler(
          c.resolve("eventManager"),
          c.resolve("game"),
          c.resolve("lessonManager"),
          c.resolve("authManager"),
          c.resolve("notification"),
          c.resolve("pageBuilder"),
        ),
    );
    this.container.register(
      "authEventHandler",
      (c) =>
        new AuthEventHandler(
          c.resolve("eventManager"),
          c.resolve("auth"),
          c.resolve("sidebar"),
          c.resolve("controlManager"),
        ),
    );
    this.container.register(
      "navigationEventHandler",
      (c) =>
        new NavigationEventHandler(
          c.resolve("eventManager"),
          c.resolve("pageBuilder"),
          c.resolve("tabManager"),
          c.resolve("authManager"),
        ),
    );
    this.container.register(
      "lessonEventHandler",
      (c) =>
        new LessonEventHandler(
          c.resolve("eventManager"),
          c.resolve("lessonManager"),
        ),
    );
    this.container.register(
      "statsEventHandler",
      (c) =>
        new StatsEventHandler(
          c.resolve("eventManager"),
          c.resolve("statsManager"),
        ),
    );
    this.container.register(
      "historyEventHandler",
      (c) =>
        new HistoryEventHandler(
          c.resolve("eventManager"),
          c.resolve("statsManager"),
          c.resolve("authManager"),
          c.resolve("notification"),
        ),
    );
    this.container.register(
      "pageEventBinder",
      (c) =>
        new PageEventBinder(
          c.resolve("eventManager"),
          c.resolve("pageBuilder"),
        ),
    );
    this.container.register(
      "adminPanel",
      (c) => new AdminPanel(c.resolve("api")),
    );
  }

  get service() {
    return this.container.resolve.bind(this.container);
  }

  async init() {
    this.buildUI();
    const pageBuilder = this.service("pageBuilder");
    const trainPage = pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.initTextDisplay();
    }
    const controlManager = this.service("controlManager");
    const game = this.service("game");
    const authManager = this.service("authManager");
    const gameEventHandler = this.service("gameEventHandler");
    const authEventHandler = this.service("authEventHandler");
    const navigationEventHandler = this.service("navigationEventHandler");
    const lessonEventHandler = this.service("lessonEventHandler");
    const statsEventHandler = this.service("statsEventHandler");
    const historyEventHandler = this.service("historyEventHandler");
    const pageEventBinder = this.service("pageEventBinder");
    const lessonManager = this.service("lessonManager");
    const statsManager = this.service("statsManager");

    controlManager.init();
    await game.init();
    authManager.init();
    gameEventHandler.init();
    authEventHandler.init();
    navigationEventHandler.init();
    lessonEventHandler.init();
    statsEventHandler.init();
    historyEventHandler.init();
    pageEventBinder.bindAll();

    if (trainPage) {
      trainPage.attachStartListener(() => {
        this.eventManager.emit("game:start");
      });
      trainPage.attachResetListener(() => {
        this.eventManager.emit("game:reset");
      });
    }

    await authManager.checkSession();
    await navigationEventHandler.restoreTab();
    await this.loadInitialData();
    this.applyAuthState();
  }

  buildUI() {
    const sidebarContainer = document.getElementById("sidebar");
    const mainContainer = document.getElementById("main-content");
    const sidebar = this.service("sidebar");
    const pageBuilder = this.service("pageBuilder");
    if (sidebarContainer) {
      sidebarContainer.innerHTML = sidebar.render();
    }
    if (mainContainer) {
      mainContainer.innerHTML = pageBuilder.buildMainContent();
    }
  }

  async loadInitialData() {
    const authManager = this.service("authManager");
    const lessonManager = this.service("lessonManager");
    const statsManager = this.service("statsManager");
    await lessonManager.loadLessons();
    if (authManager.isLoggedIn()) {
      await lessonManager.loadProgress();
      await statsManager.loadUserStats();
      await statsManager.loadLeaderboard();
    }
  }

  applyAuthState() {
    const authManager = this.service("authManager");
    const controlManager = this.service("controlManager");
    if (!authManager.isLoggedIn()) {
      controlManager.disable();
    } else {
      controlManager.enable();
    }
  }

  destroy() {
    this.service("eventManager").clear();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App();
  await app.init();
  window.app = app;
  window.adminPanel = app.service("adminPanel");
  window.loadUserStats = () => app.service("statsManager").loadUserStats();
  window.loadLessons = () => app.service("lessonManager").loadLessons();
});

export { App };
