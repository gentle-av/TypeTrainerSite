class SessionManager {
  constructor() {
    this.baseUrl = "";
  }

  async saveTab(tab) {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      console.log("User not logged in, skipping save");
      return false;
    }

    console.log("Saving tab:", tab, "for user:", userId);
    try {
      const response = await fetch("/api/session/tab", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tab, user_id: parseInt(userId) }),
      });
      const data = await response.json();
      console.log("Save tab response:", data);
      return data.success;
    } catch (error) {
      console.error("Error saving tab:", error);
      return false;
    }
  }

  async getTab() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      console.log("User not logged in");
      return "train";
    }

    try {
      const response = await fetch(`/api/session/tab?user_id=${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Get tab response:", data);
      return data.tab || "train";
    } catch (error) {
      console.error("Error getting tab:", error);
      return "train";
    }
  }
}

window.sessionManager = new SessionManager();
export { SessionManager };
