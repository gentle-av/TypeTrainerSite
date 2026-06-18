class LessonEventHandler {
  constructor(eventManager, lessonManager) {
    this.eventManager = eventManager;
    this.lessonManager = lessonManager;
    this.isLoading = false;
  }

  init() {
    this.eventManager.on("lessons:load", this.handleLoad.bind(this));
    this.eventManager.on("lesson:start", this.handleStart.bind(this));
  }

  async handleLoad() {
    if (this.isLoading) return;
    this.isLoading = true;
    await this.lessonManager.loadLessons();
    if (this.lessonManager.authManager?.isLoggedIn()) {
      await this.lessonManager.loadProgress();
    }
    this.isLoading = false;
  }

  async handleStart(data) {
    if (this.isLoading) return;
    await this.lessonManager.startLesson(data.lessonId);
  }
}

export { LessonEventHandler };
