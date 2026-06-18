// core/GameEventHandler.js
export class GameEventHandler {
  constructor(
    eventManager,
    game,
    lessonManager,
    authManager,
    notification,
    pageBuilder,
  ) {
    this.eventManager = eventManager;
    this.game = game;
    this.lessonManager = lessonManager;
    this.authManager = authManager;
    this.notification = notification;
    this.pageBuilder = pageBuilder;
  }

  init() {
    this.eventManager.on("game:start", this.handleStart.bind(this));
    this.eventManager.on("game:reset", this.handleReset.bind(this));
    this.eventManager.on("game:difficulty", this.handleDifficulty.bind(this));
    this.eventManager.on("lesson:start", this.handleLessonStart.bind(this));
    this.game.setOnStart(() => this.handleGameStart());
    this.game.setOnEnd(() => this.handleGameEnd());
    this.game.setOnReset(() => this.handleGameReset());
  }

  getGame() {
    return this.game;
  }

  handleStart() {
    if (!this.authManager.isLoggedIn()) {
      this.notification.error("Необходимо авторизоваться");
      this.eventManager.emit("auth:open");
      return;
    }
    this.lessonManager.clearCurrentLesson();
    this.game.start();
  }

  handleReset() {
    if (!this.authManager.isLoggedIn()) {
      this.notification.error("Необходимо авторизоваться");
      this.eventManager.emit("auth:open");
      return;
    }
    this.game.reset();
    this.lessonManager.clearCurrentLesson();
  }

  handleDifficulty(data) {
    this.lessonManager.clearCurrentLesson();
    this.game.setDifficulty(data.difficulty);
    this.game.loadNewText();
  }

  handleLessonStart(data) {
    const lesson = data.lesson;
    this.game.loadText(lesson.text);
    this.game.setLessonMode(true);
    this.game.resetProgress();
    this.game.stats.reset();
    this.notification.info(`📚 Урок: ${lesson.title}`);
  }

  handleGameStart() {
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.setGameState("active");
      trainPage.setControlsEnabled(false);
    }
  }

  handleGameEnd() {
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

  handleGameReset() {
    const trainPage = this.pageBuilder.getPageInstance("train");
    if (trainPage) {
      trainPage.setGameState("waiting");
      trainPage.setControlsEnabled(this.authManager.isLoggedIn());
    }
  }
}
