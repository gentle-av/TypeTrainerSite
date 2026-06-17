export class Lessons {
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
}
