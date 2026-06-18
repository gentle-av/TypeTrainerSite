class LessonEventHandler {
  constructor(eventManager, lessonManager) {
    this.eventManager = eventManager;
    this.lessonManager = lessonManager;
  }

  init() {
    this.eventManager.on("lessons:load", this.handleLoad.bind(this));
    this.eventManager.on("lesson:start", this.handleStart.bind(this));
  }

  async handleLoad() {
    await this.lessonManager.loadLessons();
    if (this.lessonManager.authManager?.isLoggedIn()) {
      await this.lessonManager.loadProgress();
    }
  }

  async handleStart(data) {
    await this.lessonManager.startLesson(data.lessonId);
  }
}

export { LessonEventHandler };
