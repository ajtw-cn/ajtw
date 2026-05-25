(function () {
  const AUTH_KEY = "pw_user";

  const session = getSession();
  if (!session || session.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  loadShopData();
  initAuthBar(session);
  renderDashboard(session);

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  }

  function loadShopData() {
    try {
      const raw = localStorage.getItem('admin_shop_data');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      SHOPS.splice(0, SHOPS.length, ...saved);
    } catch {
      // ignore invalid storage data
    }
  }

  function saveShopData() {
    try {
      localStorage.setItem('admin_shop_data', JSON.stringify(SHOPS));
    } catch {
      // ignore storage errors
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
      <tr data-id="${shop.id}">
        <td>${shop.id}</td>
        <td>${escapeHtml(shop.name)}</td>
        <td>${escapeHtml(shop.games.slice(0, 2).join("、"))}${shop.games.length > 2 ? "…" : ""}</td>
        <td>${escapeHtml(shop.styles.join("、"))}</td>
        <td>${shop.priceMin}-${shop.priceMax}</td>
        <td>${shop.timeSlots.map((t) => TIME_LABELS[t]).join("、")}</td>
        <td><button type="button" class="btn btn-secondary btn-delete" data-id="${shop.id}">删除</button></td>
      </tr>
    `).join("");

    // attach delete handlers
    document.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        if (confirm('确认删除该店铺？')) {
          deleteShop(id);
        }
      });
    });
  }

  function deleteShop(id) {
    const idx = SHOPS.findIndex((s) => s.id === id);
    if (idx === -1) return;
    SHOPS.splice(idx, 1);
    saveShopData();
    renderDashboard(getSession());
  }

  // Add shop UI handling
  (function initAddShop() {
    const addBtn = document.getElementById('addShopBtn');
    const form = document.getElementById('addShopForm');
    const saveBtn = document.getElementById('saveShopBtn');
    const cancelBtn = document.getElementById('cancelShopBtn');

    if (!addBtn || !form) return;

    addBtn.addEventListener('click', () => {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    cancelBtn.addEventListener('click', () => {
      form.style.display = 'none';
      clearAddForm();
    });

    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('shopName').value.trim();
      const games = document.getElementById('shopGames').value.split(',').map(s => s.trim()).filter(Boolean);
      const styles = document.getElementById('shopStyles').value.split(',').map(s => s.trim()).filter(Boolean);
      const priceMin = Number(document.getElementById('priceMin').value) || 0;
      const priceMax = Number(document.getElementById('priceMax').value) || 0;

      if (!name) { alert('请输入店铺名称'); return; }
      const newId = (SHOPS.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1;
      const newShop = {
        id: newId,
        name,
        games: games.length ? games : ["其他"],
        styles: styles.length ? styles : ["娱乐型"],
        priceMin,
        priceMax,
        nightPackPrice: null,
        tags: [],
        reviews: { good: [], bad: [] },
        timeSlots: ["evening"],
        highlight: "新添加店铺"
      };
      SHOPS.push(newShop);
      saveShopData();
      form.style.display = 'none';
      clearAddForm();
      renderDashboard(getSession());
    });

    function clearAddForm() {
      document.getElementById('shopName').value = '';
      document.getElementById('shopGames').value = '';
      document.getElementById('shopStyles').value = '';
      document.getElementById('priceMin').value = '';
      document.getElementById('priceMax').value = '';
    }
  })();

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
