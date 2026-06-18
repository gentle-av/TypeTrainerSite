export class Lessons {
  constructor() {
    this.lessons = [];
    this.progress = {};
  }

  render() {
    return `
      <div class="lessons-page">
        <div class="lessons-header">
          <h2>📚 Уроки скоропечатания</h2>
          <p>Выберите урок для тренировки</p>
        </div>
        <div class="lessons-grid" id="lessonsGrid">
          <div class="loading">Загрузка уроков...</div>
        </div>
        <div class="lesson-progress" id="lessonProgress" style="display:none;">
          <h3>Прогресс урока</h3>
          <div class="progress-bar">
            <div class="progress-fill" id="lessonProgressFill" style="width: 0%;"></div>
          </div>
          <span id="lessonProgressText">0%</span>
        </div>
      </div>
    `;
  }

  updateLessons(lessons) {
    this.lessons = lessons;
    this.renderLessons();
  }

  renderLessons() {
    const grid = document.getElementById("lessonsGrid");
    if (!grid) return;
    if (this.lessons.length === 0) {
      grid.innerHTML = '<div class="empty">Нет доступных уроков</div>';
      return;
    }
    grid.innerHTML = this.lessons
      .map((lesson) => this.createLessonCard(lesson))
      .join("");
  }

  createLessonCard(lesson) {
    const status = this.getLessonStatus(lesson.id);
    return `
      <div class="lesson-card" data-id="${lesson.id}">
        <div class="lesson-header">
          <span class="lesson-difficulty ${lesson.difficulty}">${this.getDifficultyLabel(lesson.difficulty)}</span>
          <span class="lesson-order">Урок ${lesson.order}</span>
        </div>
        <h3 class="lesson-title">${lesson.title}</h3>
        <p class="lesson-description">${lesson.description}</p>
        <div class="lesson-status" id="lessonStatus_${lesson.id}">
          ${status}
        </div>
        <button class="btn-start-lesson" data-id="${lesson.id}">Начать урок</button>
      </div>
    `;
  }

  getLessonStatus(lessonId) {
    const data = this.progress[lessonId];
    if (!data) {
      return '<span class="status-badge not-started">⏳ Не начат</span>';
    }
    if (data.completed) {
      return `<span class="status-badge completed">✅ Пройден (${Math.round(data.cpm)} CPM, ${data.accuracy.toFixed(1)}%)</span>`;
    }
    return '<span class="status-badge in-progress">🔄 В процессе</span>';
  }

  updateProgress(progress) {
    this.progress = progress;
    this.renderProgress();
  }

  renderProgress() {
    let completed = 0;
    let total = 0;
    Object.keys(this.progress).forEach((id) => {
      const status = document.getElementById(`lessonStatus_${id}`);
      if (status) {
        const data = this.progress[id];
        total++;
        if (data.completed) {
          completed++;
          status.innerHTML = `<span class="status-badge completed">✅ Пройден (${Math.round(data.cpm)} CPM, ${data.accuracy.toFixed(1)}%)</span>`;
        } else {
          status.innerHTML = `<span class="status-badge in-progress">🔄 В процессе</span>`;
        }
      }
    });

    this.updateProgressBar(completed, total);
  }

  updateProgressBar(completed, total) {
    const container = document.getElementById("lessonProgress");
    if (container && total > 0) {
      container.style.display = "block";
      const percent = Math.round((completed / total) * 100);
      const fill = document.getElementById("lessonProgressFill");
      const text = document.getElementById("lessonProgressText");
      if (fill) fill.style.width = `${percent}%`;
      if (text) text.textContent = `${percent}% (${completed}/${total})`;
    }
  }

  getDifficultyLabel(difficulty) {
    const labels = {
      easy: "🟢 Лёгкий",
      medium: "🟡 Средний",
      hard: "🔴 Сложный",
    };
    return labels[difficulty] || difficulty;
  }

  attachLessonListeners(callback) {
    document.querySelectorAll(".btn-start-lesson").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        callback(id);
      });
    });
  }
}
