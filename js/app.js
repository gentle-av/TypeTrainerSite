import { Api } from "./core/Api.js";
import { Notification } from "./components/Notification.js";
import { Leaderboard } from "./components/Leaderboard.js";
import { History } from "./components/History.js";
import { Auth } from "./components/Auth.js";
import { AdminPanel } from "./components/Admin.js";
import { Sidebar } from "./components/Sidebar.js";
import { TrainPage } from "./pages/TrainPage.js";
import { StatsPage } from "./pages/StatsPage.js";
import { Lessons } from "./pages/Lessons.js";
import { Stats } from "./components/Stats.js";
import { TextDisplay } from "./components/TextDisplay.js";
import { Game } from "./core/Game.js";

const api = new Api();
const notification = new Notification();
const leaderboard = new Leaderboard(api);
const history = new History(api);
const auth = new Auth(api, notification);
const sidebar = new Sidebar();
const trainPage = new TrainPage();
const statsPage = new StatsPage();
const lessonsPage = new Lessons();
let currentGame = null;
let stats = null;
let textDisplay = null;
let currentLessonId = null;

function disableAllControls() {
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const difficultyBtns = document.querySelectorAll(".difficulty-btn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.style.opacity = "0.5";
    startBtn.style.cursor = "not-allowed";
  }
  if (resetBtn) {
    resetBtn.disabled = true;
    resetBtn.style.opacity = "0.5";
    resetBtn.style.cursor = "not-allowed";
  }
  difficultyBtns.forEach((btn) => {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
  });
  if (clearHistoryBtn) {
    clearHistoryBtn.disabled = true;
    clearHistoryBtn.style.opacity = "0.5";
    clearHistoryBtn.style.cursor = "not-allowed";
  }
  document.body.classList.add("auth-locked");
}

function enableAllControls() {
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const difficultyBtns = document.querySelectorAll(".difficulty-btn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
    startBtn.style.cursor = "pointer";
  }
  if (resetBtn) {
    resetBtn.disabled = false;
    resetBtn.style.opacity = "1";
    resetBtn.style.cursor = "pointer";
  }
  difficultyBtns.forEach((btn) => {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  });
  if (clearHistoryBtn) {
    clearHistoryBtn.disabled = false;
    clearHistoryBtn.style.opacity = "1";
    clearHistoryBtn.style.cursor = "pointer";
  }
  document.body.classList.remove("auth-locked");
}

async function restoreTab(savedTab) {
  let attempts = 0;
  const maxAttempts = 10;
  return new Promise((resolve) => {
    const restoreInterval = setInterval(() => {
      const navBtns = document.querySelectorAll(".nav-btn");
      const targetBtn = Array.from(navBtns).find(
        (btn) => btn.dataset.page === savedTab,
      );
      if (targetBtn) {
        targetBtn.click();
        clearInterval(restoreInterval);
        resolve(true);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(restoreInterval);
          console.warn("Failed to restore tab after", maxAttempts, "attempts");
          resolve(false);
        }
      }
    }, 100);
  });
}

async function loadLessons() {
  try {
    const response = await fetch("/api/lessons");
    const lessons = await response.json();
    renderLessons(lessons);
    if (auth.isLoggedIn) {
      await loadLessonProgress();
    }
  } catch (error) {
    console.error("Failed to load lessons:", error);
    const grid = document.getElementById("lessonsGrid");
    if (grid) {
      grid.innerHTML = '<div class="error">Ошибка загрузки уроков</div>';
    }
  }
}

function getDifficultyLabel(difficulty) {
  const labels = {
    easy: "🟢 Лёгкий",
    medium: "🟡 Средний",
    hard: "🔴 Сложный",
  };
  return labels[difficulty] || difficulty;
}

function renderLessons(lessons) {
  const grid = document.getElementById("lessonsGrid");
  if (!grid) return;
  if (lessons.length === 0) {
    grid.innerHTML = '<div class="empty">Нет доступных уроков</div>';
    return;
  }
  grid.innerHTML = lessons
    .map(
      (lesson) => `
    <div class="lesson-card" data-id="${lesson.id}">
      <div class="lesson-header">
        <span class="lesson-difficulty ${lesson.difficulty}">${getDifficultyLabel(lesson.difficulty)}</span>
        <span class="lesson-order">Урок ${lesson.order}</span>
      </div>
      <h3 class="lesson-title">${lesson.title}</h3>
      <p class="lesson-description">${lesson.description}</p>
      <div class="lesson-status" id="lessonStatus_${lesson.id}">
        <span class="status-badge not-started">⏳ Не начат</span>
      </div>
      <button class="btn-start-lesson" data-id="${lesson.id}">Начать урок</button>
    </div>
  `,
    )
    .join("");
  document.querySelectorAll(".btn-start-lesson").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      startLesson(id);
    });
  });
}

async function loadLessonProgress() {
  try {
    const response = await fetch("/api/lessons/progress");
    const progress = await response.json();
    let completedCount = 0;
    let totalCount = 0;
    Object.keys(progress).forEach((lessonId) => {
      const status = document.getElementById(`lessonStatus_${lessonId}`);
      if (status) {
        const data = progress[lessonId];
        totalCount++;
        if (data.completed) {
          completedCount++;
          status.innerHTML = `<span class="status-badge completed">✅ Пройден (${Math.round(data.cpm)} CPM, ${data.accuracy.toFixed(1)}%)</span>`;
        } else {
          status.innerHTML = `<span class="status-badge in-progress">🔄 В процессе</span>`;
        }
      }
    });
    const progressContainer = document.getElementById("lessonProgress");
    if (progressContainer && totalCount > 0) {
      progressContainer.style.display = "block";
      const percent = Math.round((completedCount / totalCount) * 100);
      document.getElementById("lessonProgressFill").style.width = percent + "%";
      document.getElementById("lessonProgressText").textContent =
        percent + "% (" + completedCount + "/" + totalCount + ")";
    }
  } catch (error) {
    console.error("Failed to load progress:", error);
  }
}

async function startLesson(lessonId) {
  if (!auth.isLoggedIn) {
    notification.error("Необходимо авторизоваться");
    auth.open();
    return;
  }
  try {
    const response = await fetch(`/api/lessons/${lessonId}`);
    const lesson = await response.json();
    currentLessonId = lessonId;
    document.querySelector('.nav-btn[data-page="train"]')?.click();
    if (currentGame) {
      currentGame.loadText(lesson.text);
      currentGame.setLessonMode(true);
      currentGame.resetProgress();
      currentGame.stats.reset();
      notification.info(`📚 Урок: ${lesson.title}`);
    }
  } catch (error) {
    console.error("Failed to load lesson:", error);
    notification.error("Ошибка загрузки урока");
  }
}

async function saveLessonProgress(cpm, accuracy) {
  if (!auth.isLoggedIn || !currentLessonId) return;
  try {
    await fetch("/api/lessons/progress", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson_id: currentLessonId,
        completed: true,
        cpm: Math.round(cpm),
        accuracy: accuracy,
      }),
    });
    currentLessonId = null;
  } catch (error) {
    console.error("Failed to save lesson progress:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const sidebarContainer = document.getElementById("sidebar");
  const mainContainer = document.getElementById("main-content");
  if (sidebarContainer) sidebarContainer.innerHTML = sidebar.render();
  if (mainContainer) {
    mainContainer.innerHTML = `
      <div id="trainPage" class="page active">${trainPage.render()}</div>
      <div id="lessonsPage" class="page">${lessonsPage.render()}</div>
      <div id="statsPage" class="page">${statsPage.render()}</div>
    `;
  }
  stats = new Stats();
  textDisplay = new TextDisplay();
  leaderboard.load();
  history.load();
  currentGame = new Game(
    api,
    notification,
    leaderboard,
    history,
    stats,
    textDisplay,
  );
  window.game = currentGame;
  currentGame.setOnStart(() => {
    const textContainer = document.getElementById("textContainer");
    if (textContainer) {
      textContainer.classList.remove("waiting");
      textContainer.classList.add("active");
    }
    const startBtn = document.getElementById("startBtn");
    if (startBtn) startBtn.disabled = true;
  });
  currentGame.setOnEnd(async () => {
    const textContainer = document.getElementById("textContainer");
    if (textContainer) {
      textContainer.classList.add("completing");
      setTimeout(() => {
        textContainer.classList.remove("completing");
        textContainer.classList.add("waiting");
      }, 1500);
    }
    const startBtn = document.getElementById("startBtn");
    if (startBtn && auth.isLoggedIn) startBtn.disabled = false;
    if (currentLessonId) {
      const cpm = currentGame.calculateCPM();
      const accuracy = currentGame.calculateAccuracy();
      await saveLessonProgress(cpm, accuracy);
    }
  });
  currentGame.setOnReset(() => {
    const textContainer = document.getElementById("textContainer");
    if (textContainer) {
      textContainer.classList.add("waiting");
      textContainer.classList.remove("active");
    }
    const startBtn = document.getElementById("startBtn");
    if (startBtn && auth.isLoggedIn) startBtn.disabled = false;
  });
  await currentGame.init();
  auth.setGame(currentGame);
  auth.setOnLogin(() => {
    sidebar.updateAuth(true, auth.currentUser?.login);
    enableAllControls();
    if (auth.isLoggedIn) {
      loadUserStats();
    }
  });
  auth.setOnLogout(() => {
    sidebar.updateAuth(false, "");
    disableAllControls();
    const textContainer = document.getElementById("textContainer");
    if (textContainer) {
      textContainer.classList.add("waiting");
      textContainer.classList.remove("active");
    }
  });
  await auth.checkSession();
  if (auth.isLoggedIn) {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      try {
        const response = await fetch(`/api/session/tab?user_id=${userId}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        const savedTab = data.tab || "train";
        console.log("Restoring tab:", savedTab);
        setTimeout(() => {
          restoreTab(savedTab);
        }, 150);
      } catch (error) {
        console.error("Error getting tab:", error);
      }
    }
  }
  setupDifficultyButtons();
  document
    .getElementById("authBtn")
    ?.addEventListener("click", () => auth.open());
  document
    .getElementById("logoutBtn")
    ?.addEventListener("click", () => auth.logout());
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const page = btn.dataset.page;
      sidebar.updateNav(page);
      document
        .getElementById("trainPage")
        ?.classList.toggle("active", page === "train");
      document
        .getElementById("lessonsPage")
        ?.classList.toggle("active", page === "lessons");
      document
        .getElementById("statsPage")
        ?.classList.toggle("active", page === "stats");
      if (page === "stats" && auth.isLoggedIn) {
        loadUserStats();
      }
      if (page === "lessons") {
        loadLessons();
      }
      if (auth.isLoggedIn) {
        try {
          await fetch("/api/session/tab", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tab: page }),
          });
        } catch (error) {
          console.error("Error saving tab:", error);
        }
      }
    });
  });
  document
    .getElementById("clearHistoryBtn")
    ?.addEventListener("click", async () => {
      if (!auth.isLoggedIn) {
        notification.error("Необходимо авторизоваться");
        auth.open();
        return;
      }
      if (confirm("Вы уверены, что хотите очистить всю историю?")) {
        await leaderboard.clearHistory();
        await history.load();
      }
    });
  document.getElementById("startBtn")?.addEventListener("click", () => {
    if (!auth.isLoggedIn) {
      notification.error("Необходимо авторизоваться");
      auth.open();
      return;
    }
    if (currentLessonId) {
      currentLessonId = null;
    }
    currentGame?.start();
  });
  document.getElementById("resetBtn")?.addEventListener("click", () => {
    if (!auth.isLoggedIn) {
      notification.error("Необходимо авторизоваться");
      auth.open();
      return;
    }
    currentGame?.reset();
    if (currentLessonId) {
      currentLessonId = null;
    }
  });
  if (!auth.isLoggedIn) {
    disableAllControls();
  } else {
    enableAllControls();
  }
});

function setupDifficultyButtons() {
  const trainPageContainer = document.getElementById("trainPage");
  if (!trainPageContainer) return;
  trainPageContainer.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!auth.isLoggedIn) {
        notification.error("Необходимо авторизоваться");
        auth.open();
        return;
      }
      const difficulty = btn.dataset.difficulty;
      trainPageContainer.querySelectorAll(".difficulty-btn").forEach((b) => {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      if (currentGame) {
        currentLessonId = null;
        currentGame.setDifficulty(difficulty);
        currentGame.loadNewText();
      }
    });
  });
}

async function loadUserStats() {
  try {
    const response = await fetch("/api/user/stats");
    if (!response.ok) return;
    const data = await response.json();
    const totalTests = document.getElementById("totalTests");
    const avgCpm = document.getElementById("avgCpm");
    const avgAccuracy = document.getElementById("avgAccuracy");
    const bestCpm = document.getElementById("bestCpm");
    const personalHistory = document.getElementById("personalHistory");
    if (totalTests) totalTests.textContent = data.total_tests || 0;
    if (avgCpm) avgCpm.textContent = Math.round(data.average_cpm || 0);
    if (avgAccuracy)
      avgAccuracy.textContent = (data.average_accuracy || 0).toFixed(1);
    if (bestCpm) bestCpm.textContent = data.best_cpm || 0;
    if (personalHistory && data.history) {
      if (data.history.length === 0) {
        personalHistory.innerHTML =
          '<div class="history-empty">Нет результатов</div>';
      } else {
        personalHistory.innerHTML = data.history
          .map(
            (entry) => `
          <div class="history-item">
            <span class="history-cpm">${Math.round(entry.cpm)} CPM</span>
            <span class="history-accuracy">${entry.accuracy.toFixed(1)}%</span>
            <span class="history-errors">Ошибок: ${entry.errors}</span>
            <span class="history-characters">Символов: ${entry.characters}</span>
            <span class="history-date">${new Date(entry.created_at).toLocaleString()}</span>
          </div>
        `,
          )
          .join("");
      }
    }
  } catch (error) {
    console.error("Failed to load user stats:", error);
    const personalHistory = document.getElementById("personalHistory");
    if (personalHistory) {
      personalHistory.innerHTML =
        '<div class="history-empty">Ошибка загрузки</div>';
    }
  }
}

window.adminPanel = new AdminPanel(api);
window.loadUserStats = loadUserStats;
window.loadLessons = loadLessons;
