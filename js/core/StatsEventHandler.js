class StatsEventHandler {
  constructor(eventManager, statsManager) {
    this.eventManager = eventManager;
    this.statsManager = statsManager;
  }

  init() {
    this.eventManager.on("stats:load", this.handleLoad.bind(this));
    this.eventManager.on("user:logged_in", this.handleUserLogin.bind(this));
  }

  async handleLoad() {
    await this.statsManager.loadUserStats();
    await this.statsManager.loadLeaderboard();
  }

  async handleUserLogin() {
    await this.statsManager.loadUserStats();
    await this.statsManager.loadLeaderboard();
  }
}

export { StatsEventHandler };
