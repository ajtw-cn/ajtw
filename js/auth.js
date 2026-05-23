(function () {
  const AUTH_KEY = "pw_user";

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = "login.html";
  }

  function initAuthBar() {
    const headerInner = document.querySelector(".header-inner");
    if (!headerInner) return;

    const session = getSession();
    const bar = document.createElement("div");
    bar.className = "auth-bar";

    if (session) {
      const isAdmin = session.role === "admin";
      const name = session.displayName || session.username;
      bar.innerHTML = `
        <span class="auth-user">
          ${isAdmin ? "🛡️" : "👤"} ${escapeHtml(name)}
          ${isAdmin ? '<span class="user-role-tag">管理员</span>' : ""}
        </span>
        ${isAdmin ? '<a href="admin.html" class="btn btn-auth">管理后台</a>' : ""}
        <button type="button" class="btn btn-auth" id="logoutBtn">退出登录</button>
      `;
    } else {
      bar.innerHTML = `
        <a href="login.html" class="btn btn-auth btn-auth-primary">登录</a>
      `;
    }

    headerInner.appendChild(bar);

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  initAuthBar();
})();
