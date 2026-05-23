(function () {
  const form = document.getElementById("requirementForm");
  const gameSelect = document.getElementById("game");
  const budgetSelect = document.getElementById("budget");
  const styleContainer = document.getElementById("styleOptions");
  const timeContainer = document.getElementById("timeOptions");
  const customGameGroup = document.getElementById("customGameGroup");
  const resultsSection = document.getElementById("resultsSection");
  const resultsHeader = document.getElementById("resultsHeader");
  const resultsBody = document.getElementById("resultsBody");
  const fillExampleBtn = document.getElementById("fillExample");

  function initOptions() {
    GAME_OPTIONS.forEach((game) => {
      const opt = document.createElement("option");
      opt.value = game;
      opt.textContent = game;
      gameSelect.appendChild(opt);
    });

    BUDGET_OPTIONS.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.value;
      opt.textContent = b.label;
      budgetSelect.appendChild(opt);
    });
    budgetSelect.value = "any";

    STYLE_OPTIONS.forEach((s) => {
      styleContainer.appendChild(createChip("style", s.value, s.label));
    });

    TIME_OPTIONS.forEach((t) => {
      timeContainer.appendChild(createChip("time", t.value, t.label));
    });
  }

  function createChip(name, value, label) {
    const labelEl = document.createElement("label");
    labelEl.className = "chip";
    labelEl.innerHTML = `
      <input type="checkbox" name="${name}" value="${value}">
      <span>${label}</span>
    `;
    return labelEl;
  }

  gameSelect.addEventListener("change", () => {
    customGameGroup.hidden = gameSelect.value !== "其他";
  });

  fillExampleBtn.addEventListener("click", () => {
    gameSelect.value = "永劫无间";
    customGameGroup.hidden = true;

    form.querySelectorAll('input[name="style"]').forEach((el) => {
      el.checked = el.value === "技术型";
    });

    budgetSelect.value = "medium";

    form.querySelectorAll('input[name="time"]').forEach((el) => {
      el.checked = el.value === "night";
    });

    document.getElementById("extra").value =
      "能带我上分，价格不要太贵，最好晚上能打。";

    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      customGameGroup.hidden = true;
      resultsSection.hidden = true;
    }, 0);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = recommend(new FormData(form));
    renderResults(result);
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderResults(result) {
    resultsHeader.innerHTML = "";
    resultsBody.innerHTML = "";

    if (result.type === "clarify") {
      resultsHeader.innerHTML = "<h2>需要更多信息</h2>";
      resultsBody.innerHTML = `
        <div class="clarify-box">
          <h3>请补充以下关键信息：</h3>
          <ol>
            ${result.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}
          </ol>
          <p class="clarify-note">${escapeHtml(result.note)}</p>
        </div>
      `;
      return;
    }

    if (result.type === "empty") {
      resultsHeader.innerHTML = "<h2>推荐结果</h2>";
      resultsBody.innerHTML = `
        <p class="empty-message">${escapeHtml(result.message)}</p>
        <p class="results-note">以下为示例信息，仅供参考</p>
      `;
      result.fallback.forEach((item, i) => {
        resultsBody.appendChild(createShopCard(item.shop, item.recommendReason, i));
      });
      return;
    }

    const req = result.requirements;
    const summaryParts = [];
    if (req.resolvedGame) summaryParts.push(`游戏：${req.resolvedGame}`);
    if (req.styles.length) summaryParts.push(`风格：${req.styles.join("、")}`);
    if (req.budget !== "any") {
      const b = BUDGET_OPTIONS.find((x) => x.value === req.budget);
      if (b) summaryParts.push(`预算：${b.label}`);
    }
    if (req.times.length) {
      summaryParts.push(`时段：${req.times.map((t) => TIME_LABELS[t]).join("、")}`);
    }

    resultsHeader.innerHTML = `
      <h2>为您找到 ${result.results.length} 家匹配店铺</h2>
      <p class="results-note">${escapeHtml(result.note)}</p>
      ${summaryParts.length ? `<p class="req-summary">当前需求：${escapeHtml(summaryParts.join(" · "))}</p>` : ""}
    `;

    result.results.forEach((item, i) => {
      resultsBody.appendChild(createShopCard(item.shop, item.recommendReason, i));
    });
  }

  function createShopCard(shop, reason, index) {
    const card = document.createElement("article");
    card.className = "shop-card" + (index === 0 ? " top-pick" : "");

    const priceText = shop.nightPackPrice
      ? `${shop.priceMin}-${shop.priceMax} 元/小时（包夜 ${shop.nightPackPrice}）`
      : `${shop.priceMin}-${shop.priceMax} 元/小时`;

    const rankBadge =
      index === 0
        ? '<span class="rank-badge">首选推荐</span>'
        : `<span class="rank-badge">推荐 #${index + 1}</span>`;

  card.innerHTML = [
      '<div class="shop-header">',
      `<h3 class="shop-name">${escapeHtml(shop.name)}</h3>`,
      rankBadge,
      "</div>",
      '<dl class="shop-row">',
      "<dt>游戏类型</dt>",
      `<dd>${escapeHtml(shop.games.join("、"))}</dd>`,
      "<dt>陪玩风格</dt>",
      `<dd>${escapeHtml(shop.styles.join("、"))}</dd>`,
      "<dt>价格区间</dt>",
      `<dd>${escapeHtml(priceText)}</dd>`,
      "<dt>特色标签</dt>",
      "<dd>",
      '<div class="tags">',
      shop.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(""),
      "</div>",
      "</dd>",
      "</dl>",
      '<div class="reviews">',
      '<div class="review-block review-good">',
      '<div class="review-label">常见好评</div>',
      `<div>${escapeHtml(shop.reviews.good.join("、"))}</div>`,
      "</div>",
      '<div class="review-block review-bad">',
      '<div class="review-label">常见差评</div>',
      `<div>${escapeHtml(shop.reviews.bad.join("、"))}</div>`,
      "</div>",
      "</div>",
      '<div class="recommend-reason">',
      `<strong>推荐理由：</strong>${escapeHtml(reason)}`,
      "</div>"
    ].join("");

    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  initOptions();
})();
