class GameController {
  constructor(game, lessonManager, authManager, notification, pageBuilder) {
    this.game = game;
    this.lessonManager = lessonManager;
    this.authManager = authManager;
    this.notification = notification;
    this.pageBuilder = pageBuilder;
  }

  init() {
    this.game.setOnStart(() => this.onGameStart());
    this.game.setOnEnd(() => this.onGameEnd());
    this.game.setOnReset(() => this.onGameReset());
    this.game.setOnStatsUpdate((stats) => this.onStatsUpdate(stats));
    window.addEventListener("lessonStarted", (e) => {
      this.loadLessonText(e.detail.lesson);
    });
  }

  start() {
    if (!this.authManager.isLoggedIn()) {
      this.notification.error("Необходимо авторизоваться");
      this.authManager.openAuth();
      return;
    }
    this.lessonManager.clearCurrentLesson();
    this.game.start();
  }

  reset() {
    if (!this.authManager.isLoggedIn()) {
      this.notification.error("Необходимо авторизоваться");
      this.authManager.openAuth();
      return;
    }
    this.game.reset();
    this.lessonManager.clearCurrentLesson();
  }

  setDifficulty(difficulty) {
    this.lessonManager.clearCurrentLesson();
    this.game.setDifficulty(difficulty);
    this.game.loadNewText();
  }

  loadLessonText(lesson) {
    this.game.loadText(lesson.text);
    this.game.setLessonMode(true);
    this.game.resetProgress();
    this.game.stats.reset();
  }

  onGameStart() {
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.setGameState("active");
      trainPage.setControlsEnabled(false);
    }
  }

  onGameEnd() {
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.setGameState("completing");
      setTimeout(() => {
        trainPage.setGameState("waiting");
      }, 1500);
    }
    if (this.lessonManager.currentLessonId) {
      const cpm = this.game.calculateCPM();
      const accuracy = this.game.calculateAccuracy();
      this.lessonManager.saveProgress(cpm, accuracy);
    }
  }

  onGameReset() {
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.setGameState("waiting");
      trainPage.setControlsEnabled(this.authManager.isLoggedIn());
    }
  }

  onStatsUpdate(stats) {
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.updateStats(stats);
    }
  }

  getGame() {
    return this.game;
  }
}

export { GameController };
