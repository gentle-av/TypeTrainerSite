// js/core/LessonManager.js
class LessonManager {
  constructor(api, notification, pageBuilder) {
    this.api = api;
    this.notification = notification;
    this.pageBuilder = pageBuilder;
    this.currentLessonId = null;
    this.lessons = [];
    this.authManager = null;
    this.isLoading = false;
  }

  setAuthManager(authManager) {
    this.authManager = authManager;
  }

  async loadLessons() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      console.log("Loading lessons...");
      const response = await fetch("/api/lessons");
      console.log("Lessons response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.lessons = await response.json();
      console.log("Lessons loaded:", this.lessons.length);

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
        grid.innerHTML = `<div class="error">Ошибка загрузки уроков: ${error.message}</div>`;
      }
      this.notification.error("Ошибка загрузки уроков");
    } finally {
      this.isLoading = false;
    }
  }

  async loadProgress() {
    try {
      const response = await fetch("/api/lessons/progress", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.log("User not logged in, skipping progress");
          return;
        }
        return;
      }
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
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      console.log("Starting lesson:", lessonId);
      const response = await fetch(`/api/lessons/${lessonId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const lesson = await response.json();
      console.log("Lesson loaded:", lesson.title);
      this.currentLessonId = lessonId;
      const trainPage = this.pageBuilder.getPageInstance("train");
      if (trainPage) {
        trainPage.removeBlur();
        trainPage.setControlsEnabled(true);
      }
      window.dispatchEvent(
        new CustomEvent("navigateTo", {
          detail: { page: "train" },
        }),
      );
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("lessonStarted", {
            detail: { lesson, lessonId },
          }),
        );
        this.isLoading = false;
      }, 200);
      this.notification.info(`📚 Урок: ${lesson.title}`);
      return lesson;
    } catch (error) {
      console.error("Failed to load lesson:", error);
      this.notification.error("Ошибка загрузки урока");
      this.isLoading = false;
    }
  }

  async saveProgress(cpm, accuracy) {
    if (!this.currentLessonId) return;
    try {
      const response = await fetch("/api/lessons/progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: this.currentLessonId,
          completed: true,
          cpm: Math.round(cpm),
          accuracy: Math.round(accuracy),
        }),
      });
      if (response.ok) {
        await this.loadProgress();
        this.currentLessonId = null;
      }
    } catch (error) {
      console.error("Failed to save lesson progress:", error);
    }
  }

  clearCurrentLesson() {
    this.currentLessonId = null;
  }
}

export { LessonManager };
