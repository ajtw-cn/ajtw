/**
 * 根据用户需求匹配并推荐陪玩店
 */
function parseRequirements(formData) {
  const game = formData.get("game")?.trim() || "";
  const customGame = formData.get("customGame")?.trim() || "";
  const styles = formData.getAll("style");
  const budget = formData.get("budget") || "any";
  const times = formData.getAll("time");
  const extra = formData.get("extra")?.trim() || "";

  const resolvedGame = game === "其他" ? customGame : game;
  const budgetConfig = BUDGET_OPTIONS.find((b) => b.value === budget) || BUDGET_OPTIONS[3];

  return { resolvedGame, styles, budget, budgetMax: budgetConfig.max, times, extra };
}

function isRequirementVague(req) {
  const hasGame = req.resolvedGame.length > 0;
  const hasStyle = req.styles.length > 0;
  const hasExtra = req.extra.length > 0;
  return !hasGame && !hasStyle && !hasExtra;
}

function getClarifyingQuestions(req) {
  const questions = [];
  if (!req.resolvedGame) {
    questions.push("您主要想玩哪款游戏？（如永劫无间、英雄联盟、原神等）");
  }
  if (req.budget === "any" && !req.extra.match(/预算|价格|元|便宜|贵/)) {
    questions.push("您的预算大概是多少？（如 30元/小时以内，或包夜预算）");
  }
  if (req.styles.length === 0) {
    questions.push("您更看重什么？（纯上分、娱乐聊天、声音好听，还是教学指导）");
  }
  return questions.slice(0, 3);
}

function extractKeywords(text) {
  const keywords = [];
  const patterns = [
    { word: "永劫", game: "永劫无间" },
    { word: "LOL", game: "英雄联盟" },
    { word: "英雄联盟", game: "英雄联盟" },
    { word: "王者", game: "王者荣耀" },
    { word: "原神", game: "原神" },
    { word: "APEX", game: "Apex英雄" },
    { word: "Apex", game: "Apex英雄" },
    { word: "吃鸡", game: "绝地求生" },
    { word: "绝地求生", game: "绝地求生" },
    { word: "技术", style: "技术型" },
    { word: "上分", style: "技术型" },
    { word: "带飞", style: "技术型" },
    { word: "娱乐", style: "娱乐型" },
    { word: "聊天", style: "娱乐型" },
    { word: "搞笑", style: "娱乐型" },
    { word: "声控", style: "声控型" },
    { word: "声音", style: "声控型" },
    { word: "教学", style: "教学型" },
    { word: "指导", style: "教学型" },
    { word: "晚上", time: "night" },
    { word: "夜间", time: "night" },
    { word: "深夜", time: "night" },
    { word: "24小时", time: "24h" },
    { word: "便宜", budget: "low" },
    { word: "不贵", budget: "medium" }
  ];

  for (const p of patterns) {
    if (text.includes(p.word)) keywords.push(p);
  }
  return keywords;
}

function enrichFromExtra(req) {
  const enriched = { ...req, styles: [...req.styles], times: [...req.times] };
  const keywords = extractKeywords(req.extra);

  for (const kw of keywords) {
    if (kw.game && !enriched.resolvedGame) enriched.resolvedGame = kw.game;
    if (kw.style && !enriched.styles.includes(kw.style)) enriched.styles.push(kw.style);
    if (kw.time && !enriched.times.includes(kw.time)) enriched.times.push(kw.time);
    if (kw.budget && enriched.budget === "any") {
      enriched.budget = kw.budget;
      enriched.budgetMax = BUDGET_OPTIONS.find((b) => b.value === kw.budget).max;
    }
  }
  return enriched;
}

function scoreShop(shop, req) {
  let score = 0;
  const reasons = [];

  if (req.resolvedGame) {
    const gameMatch = shop.games.some(
      (g) => g.includes(req.resolvedGame) || req.resolvedGame.includes(g)
    );
    if (gameMatch) {
      score += 40;
      reasons.push(`覆盖《${req.resolvedGame}》`);
    } else if (shop.games.length >= 5) {
      score += 10;
      reasons.push("多游戏综合店，可作备选");
    } else {
      return { score: 0, reasons: [] };
    }
  } else {
    score += 15;
  }

  if (req.styles.length > 0) {
    const matched = req.styles.filter((s) => shop.styles.includes(s));
    if (matched.length > 0) {
      score += matched.length * 20;
      reasons.push(`提供${matched.join("、")}服务`);
    }
  } else {
    score += 10;
  }

  if (req.budgetMax < Infinity) {
    if (shop.priceMin <= req.budgetMax) {
      score += 25;
      reasons.push(`价格 ${shop.priceMin}-${shop.priceMax} 元/小时，符合预算`);
    } else if (shop.priceMin <= req.budgetMax + 15) {
      score += 10;
      reasons.push(`价格略超预算但接近 (${shop.priceMin}-${shop.priceMax} 元/小时)`);
    } else {
      score -= 15;
    }
  }

  if (req.times.length > 0) {
    const timeMatch = req.times.some((t) => shop.timeSlots.includes(t));
    if (timeMatch) {
      score += 20;
      const labels = req.times.filter((t) => shop.timeSlots.includes(t)).map((t) => TIME_LABELS[t]);
      reasons.push(`${labels.join("、")}时段可约`);
    }
  } else {
    score += 5;
  }

  if (req.extra.includes("小姐姐") && shop.tags.some((t) => t.includes("小姐姐"))) {
    score += 8;
    reasons.push("支持小姐姐陪玩");
  }
  if (req.extra.includes("试音") && shop.tags.some((t) => t.includes("试音"))) {
    score += 5;
  }
  if (req.extra.includes("包夜") && shop.tags.some((t) => t.includes("包夜"))) {
    score += 8;
    reasons.push("支持包夜");
  }
  if (req.extra.includes("段位") && shop.tags.some((t) => t.includes("段位"))) {
    score += 8;
    reasons.push("可指定段位");
  }

  score += Math.min(shop.reviews.good.length * 2, 10);

  return { score, reasons };
}

function buildRecommendReason(shop, req, matchReasons) {
  const parts = [...matchReasons];
  if (parts.length === 0) parts.push(shop.highlight);

  let prefix = "综合推荐：";
  if (req.resolvedGame && req.styles.includes("技术型")) {
    prefix = "技术上分推荐：";
  } else if (req.styles.includes("娱乐型") || req.styles.includes("声控型")) {
    prefix = "娱乐放松推荐：";
  }

  return prefix + parts.slice(0, 3).join("；") + "。";
}

function recommend(formData) {
  let req = parseRequirements(formData);
  req = enrichFromExtra(req);

  if (isRequirementVague(req)) {
    return {
      type: "clarify",
      questions: getClarifyingQuestions(req),
      note: "请补充以上信息，以便为您精准推荐。"
    };
  }

  const scored = SHOPS.map((shop) => {
    const { score, reasons } = scoreShop(shop, req);
    return {
      shop,
      score,
      recommendReason: buildRecommendReason(shop, req, reasons)
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      type: "empty",
      message: "暂未找到完全匹配的店铺，建议放宽预算或时段条件后重试。",
      fallback: SHOPS.slice(0, 3).map((shop) => ({
        shop,
        score: 0,
        recommendReason: shop.highlight
      }))
    };
  }

  return {
    type: "results",
    requirements: req,
    results: scored.slice(0, 5),
    note: "以下为示例信息，仅供参考，非真实店铺数据。"
  };
}
