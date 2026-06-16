import { Api } from "./core/Api.js";
import { Notification } from "./components/Notification.js";
import { Leaderboard } from "./components/Leaderboard.js";
import { History } from "./components/History.js";
import { Auth } from "./components/Auth.js";
import { AdminPanel } from "./components/Admin.js";
import { Sidebar } from "./components/Sidebar.js";
import { TrainPage } from "./pages/TrainPage.js";
import { StatsPage } from "./pages/StatsPage.js";
import { Stats } from "./components/Stats.js";
import { TextDisplay } from "./components/TextDisplay.js";
import { Game } from "./core/Game.js";
import { SessionManager } from "./core/SessionManager.js";

const api = new Api();
const notification = new Notification();
const leaderboard = new Leaderboard(api);
const history = new History(api);
const auth = new Auth(api, notification);
const sidebar = new Sidebar();
const trainPage = new TrainPage();
const statsPage = new StatsPage();
let currentGame = null;
let stats = null;
let textDisplay = null;

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

document.addEventListener("DOMContentLoaded", async () => {
  const sidebarContainer = document.getElementById("sidebar");
  const mainContainer = document.getElementById("main-content");
  if (sidebarContainer) sidebarContainer.innerHTML = sidebar.render();
  if (mainContainer) {
    mainContainer.innerHTML = `
      <div id="trainPage" class="page active">${trainPage.render()}</div>
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
  currentGame.setOnEnd(() => {
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
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        const savedTab = data.tab || "train";
        console.log("Restoring tab:", savedTab);
        document.querySelectorAll(".nav-btn").forEach((btn) => {
          if (btn.dataset.page === savedTab) {
            btn.click();
          }
        });
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
        .getElementById("statsPage")
        ?.classList.toggle("active", page === "stats");
      if (page === "stats" && auth.isLoggedIn) {
        loadUserStats();
      }
      if (auth.isLoggedIn) {
        try {
          await fetch("/api/session/tab", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
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
    currentGame?.start();
  });
  document.getElementById("resetBtn")?.addEventListener("click", () => {
    if (!auth.isLoggedIn) {
      notification.error("Необходимо авторизоваться");
      auth.open();
      return;
    }
    currentGame?.reset();
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
