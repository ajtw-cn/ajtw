(function () {
  const AUTH_KEY = "pw_user";

  const session = getSession();
  if (!session || session.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  initAuthBar(session);
  renderDashboard(session);

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  }

  function initAuthBar(session) {
    const bar = document.getElementById("adminAuthBar");
    bar.innerHTML = `
      <span class="auth-user-admin">
        🛡️ ${escapeHtml(session.displayName || session.username)}
        <span class="user-role-tag">管理员</span>
      </span>
      <button type="button" class="btn btn-auth" id="logoutBtn">退出登录</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_KEY);
      window.location.href = "login.html";
    });
  }

  function renderDashboard(session) {
    document.getElementById("welcomeTitle").textContent =
      `欢迎，${session.displayName || session.username}`;

    const games = new Set(SHOPS.flatMap((s) => s.games));
    const avgPrice = Math.round(
      SHOPS.reduce((sum, s) => sum + (s.priceMin + s.priceMax) / 2, 0) / SHOPS.length
    );
    const nightShops = SHOPS.filter((s) => s.timeSlots.includes("night")).length;

    const statsGrid = document.getElementById("statsGrid");
    statsGrid.replaceChildren();

    [
      { label: "店铺总数", value: String(SHOPS.length), highlight: true },
      { label: "覆盖游戏", value: String(games.size) },
      { label: "平均价格", value: String(avgPrice), suffix: " 元/时" },
      { label: "夜间可约", value: String(nightShops) }
    ].forEach((stat) => {
      const card = document.createElement("div");
      card.className = "stat-card" + (stat.highlight ? " highlight" : "");

      const label = document.createElement("div");
      label.className = "stat-label";
      label.textContent = stat.label;

      const value = document.createElement("div");
      value.className = "stat-value";
      value.textContent = stat.value + (stat.suffix || "");

      card.append(label, value);
      statsGrid.appendChild(card);
    });

    document.getElementById("shopCount").textContent = `共 ${SHOPS.length} 家`;
    document.getElementById("shopTableBody").innerHTML = SHOPS.map((shop) => `
      <tr>
        <td>${shop.id}</td>
        <td>${escapeHtml(shop.name)}</td>
        <td>${escapeHtml(shop.games.slice(0, 2).join("、"))}${shop.games.length > 2 ? "…" : ""}</td>
        <td>${escapeHtml(shop.styles.join("、"))}</td>
        <td>${shop.priceMin}-${shop.priceMax}</td>
        <td>${shop.timeSlots.map((t) => TIME_LABELS[t]).join("、")}</td>
      </tr>
    `).join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
