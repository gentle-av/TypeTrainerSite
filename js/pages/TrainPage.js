export class TrainPage {
  render() {
    return `
      <div class="train-header">
        <div class="difficulty-selector">
          <button class="difficulty-btn" data-difficulty="easy">Легкий</button>
          <button class="difficulty-btn active" data-difficulty="medium">Средний</button>
          <button class="difficulty-btn" data-difficulty="hard">Тяжелый</button>
        </div>
      </div>
      <div class="stats-panel">
        <div class="stat-card"><span class="stat-label">CPM</span><span class="stat-value" id="cpm">0</span></div>
        <div class="stat-card"><span class="stat-label">WPM</span><span class="stat-value" id="wpm">0</span></div>
        <div class="stat-card"><span class="stat-label">Accuracy</span><span class="stat-value" id="accuracy">100</span></div>
        <div class="stat-card"><span class="stat-label">Errors</span><span class="stat-value" id="errors">0</span></div>
      </div>
      <div class="text-container waiting" id="textContainer">
        <div class="text-display" id="textDisplay"></div>
      </div>
      <div class="controls">
        <button class="btn btn-primary" id="startBtn" disabled>Начать тест</button>
        <button class="btn btn-secondary" id="resetBtn" disabled>Сброс</button>
      </div>
    `;
  }
}
