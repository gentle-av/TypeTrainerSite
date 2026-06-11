export class AdminPanel {
  constructor(api) {
    this.api = api;
    this.modal = document.getElementById("adminModal");
    this.adminBtn = document.getElementById("adminBtn");
    this.closeBtn = document.querySelector(".close");
    this.usersList = document.getElementById("usersList");
    this.isAdmin = false;
    this.setupEventListeners();
    this.checkAdminStatus();
  }

  setupEventListeners() {
    if (this.adminBtn) {
      this.adminBtn.addEventListener("click", () => this.open());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
    document
      .getElementById("addUserBtn")
      ?.addEventListener("click", () => this.addUser());
  }

  async checkAdminStatus() {
    try {
      const response = await fetch("/api/admin/check");
      const data = await response.json();
      this.isAdmin = data.isAdmin;
      if (this.adminBtn) {
        this.adminBtn.style.display = this.isAdmin ? "block" : "none";
      }
    } catch (error) {
      console.error("Failed to check admin status:", error);
    }
  }

  open() {
    if (!this.isAdmin) return;
    this.modal.style.display = "block";
    this.loadUsers();
  }

  close() {
    this.modal.style.display = "none";
  }

  async loadUsers() {
    try {
      const response = await fetch("/api/admin/users");
      const users = await response.json();
      this.renderUsers(users);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }

  renderUsers(users) {
    if (!this.usersList) return;
    if (users.length === 0) {
      this.usersList.innerHTML = "<div>Нет пользователей</div>";
      return;
    }
    this.usersList.innerHTML = users
      .map(
        (user) => `
<div class="user-item">
<div class="user-info">
<span class="user-name">${user.username}</span>
<span class="user-login">${user.login}</span>
<span class="user-role">${user.role === "admin" ? "👑 Админ" : "👤 Пользователь"}</span>
</div>
<div class="user-actions">
<button class="btn-role" onclick="window.adminPanel.toggleRole(${user.id}, '${user.role}')">${user.role === "admin" ? "↓ Сделать пользователем" : "↑ Сделать админом"}</button>
<button class="btn-delete" onclick="window.adminPanel.deleteUser(${user.id})">🗑 Удалить</button>
</div>
</div>
`,
      )
      .join("");
  }

  async addUser() {
    const username = document.getElementById("newUsername")?.value;
    const login = document.getElementById("newLogin")?.value;
    const password = document.getElementById("newPassword")?.value;
    const role = document.getElementById("newRole")?.value;
    if (!username || !login || !password) {
      alert("Заполните все поля");
      return;
    }
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, login, password, role }),
      });
      const data = await response.json();
      if (data.success) {
        document.getElementById("newUsername").value = "";
        document.getElementById("newLogin").value = "";
        document.getElementById("newPassword").value = "";
        this.loadUsers();
        alert("Пользователь добавлен");
      } else {
        alert(data.error || "Ошибка добавления");
      }
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  }

  async deleteUser(userId) {
    if (!confirm("Удалить пользователя?")) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        this.loadUsers();
      } else {
        alert("Ошибка удаления");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  async toggleRole(userId, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (data.success) {
        this.loadUsers();
      } else {
        alert("Ошибка изменения роли");
      }
    } catch (error) {
      console.error("Failed to change role:", error);
    }
  }
}
