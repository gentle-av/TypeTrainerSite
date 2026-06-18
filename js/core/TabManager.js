export class TabManager {
  constructor(api) {
    this.api = api;
    this.currentTab = "train";
  }

  async saveTab(tab) {
    this.currentTab = tab;
    try {
      await fetch("/api/session/tab", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: tab }),
      });
    } catch (error) {
      console.error("Error saving tab:", error);
    }
  }

  async restoreTab() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return null;
    try {
      const response = await fetch(`/api/session/tab?user_id=${userId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      return data.tab || "train";
    } catch (error) {
      console.error("Error getting tab:", error);
      return null;
    }
  }
}
