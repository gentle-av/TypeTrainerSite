class LessonManager {
  constructor(api, notification, pageBuilder) {
    this.api = api;
    this.notification = notification;
    this.pageBuilder = pageBuilder;
    this.currentLessonId = null;
    this.lessons = [];
  }

  async loadLessons() {
    try {
      const response = await fetch("/api/lessons");
      this.lessons = await response.json();
      const lessonsPage = this.pageBuilder.getPageInstance("lessons");
      if (lessonsPage) {
        lessonsPage.updateLessons(this.lessons);
        lessonsPage.attachLessonListeners((id) => this.startLesson(id));
      }
      return this.lessons;
    } catch (error) {
      console.error("Failed to load lessons:", error);
      const grid = document.getElementById("lessonsGrid");
      if (grid) {
        grid.innerHTML = '<div class="error">Ошибка загрузки уроков</div>';
      }
    }
  }

  async loadProgress() {
    try {
      const response = await fetch("/api/lessons/progress");
      const progress = await response.json();
      const lessonsPage = this.pageBuilder.getPageInstance("lessons");
      if (lessonsPage) {
        lessonsPage.updateProgress(progress);
      }
      return progress;
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  }

  async startLesson(lessonId) {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`);
      const lesson = await response.json();
      this.currentLessonId = lessonId;
      window.dispatchEvent(
        new CustomEvent("navigateTo", {
          detail: { page: "train" },
        }),
      );
      window.dispatchEvent(
        new CustomEvent("lessonStarted", {
          detail: { lesson, lessonId },
        }),
      );
      this.notification.info(`📚 Урок: ${lesson.title}`);
      return lesson;
    } catch (error) {
      console.error("Failed to load lesson:", error);
      this.notification.error("Ошибка загрузки урока");
    }
  }

  async saveProgress(cpm, accuracy) {
    if (!this.currentLessonId) return;
    try {
      await fetch("/api/lessons/progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: this.currentLessonId,
          completed: true,
          cpm: Math.round(cpm),
          accuracy: accuracy,
        }),
      });
      await this.loadProgress();
      this.currentLessonId = null;
    } catch (error) {
      console.error("Failed to save lesson progress:", error);
    }
  }

  clearCurrentLesson() {
    this.currentLessonId = null;
  }
}

export { LessonManager };
