/** 示例陪玩店数据 — 仅供参考，非真实店铺 */
const SHOPS = [
  {
    id: 1,
    name: "夜影电竞陪玩馆",
    games: ["永劫无间", "Apex英雄", "绝地求生"],
    styles: ["技术型", "教学型"],
    priceMin: 35,
    priceMax: 55,
    nightPackPrice: "280-350元/8小时",
    tags: ["24小时在线", "可指定段位", "可语音试音", "晚上时段充足", "平台担保交易"],
    reviews: {
      good: ["上分稳定", "沟通清晰", "晚上响应快"],
      bad: ["热门时段需提前预约"]
    },
    timeSlots: ["night", "evening", "24h"],
    highlight: "主打永劫上分，价格在中低端，夜间在线陪玩较多"
  },
  {
    id: 2,
    name: "无间上分工作室",
    games: ["永劫无间", "永劫手游"],
    styles: ["技术型", "教学型"],
    priceMin: 40,
    priceMax: 60,
    nightPackPrice: null,
    tags: ["可指定段位", "段位认证陪玩", "可复盘", "支持2v2/3v3组队"],
    reviews: {
      good: ["操作细节讲解到位", "态度耐心"],
      bad: ["个别陪玩档期较满"]
    },
    timeSlots: ["evening", "night"],
    highlight: "专注永劫，技术向陪玩占比高，适合稳定上分"
  },
  {
    id: 3,
    name: "轻语陪玩社",
    games: ["永劫无间", "英雄联盟", "王者荣耀"],
    styles: ["技术型", "娱乐型"],
    priceMin: 30,
    priceMax: 50,
    nightPackPrice: "240-300元/8小时",
    tags: ["小姐姐/小哥哥可选", "可语音试音", "晚间活跃", "支持包段"],
    reviews: {
      good: ["性价比高", "氛围轻松", "晚上好约"],
      bad: ["顶尖段位陪玩需加价"]
    },
    timeSlots: ["evening", "night"],
    highlight: "价格友好，晚间活跃，兼顾上分和聊天"
  },
  {
    id: 4,
    name: "极夜竞技陪玩",
    games: ["永劫无间", "CS2", "Valorant"],
    styles: ["技术型"],
    priceMin: 45,
    priceMax: 65,
    nightPackPrice: null,
    tags: ["高段位认证", "可指定英雄/武器", "连麦教学", "夜间专线客服"],
    reviews: {
      good: ["实力强", "上分效率高"],
      bad: ["价格略高于普通娱乐陪玩"]
    },
    timeSlots: ["night", "24h"],
    highlight: "更看重胜率与效率时的进阶之选"
  },
  {
    id: 5,
    name: "峡谷上分驿站",
    games: ["英雄联盟", "王者荣耀"],
    styles: ["技术型", "教学型"],
    priceMin: 35,
    priceMax: 55,
    nightPackPrice: "260-320元/8小时",
    tags: ["可指定段位", "位置专精", "复盘讲解", "可语音试音"],
    reviews: {
      good: ["对线细节讲得好", "带飞稳定"],
      bad: ["周末预约较紧张"]
    },
    timeSlots: ["evening", "night", "afternoon"],
    highlight: "MOBA 上分专精，适合想提升段位的玩家"
  },
  {
    id: 6,
    name: "甜心语音陪玩屋",
    games: ["原神", "王者荣耀", "英雄联盟"],
    styles: ["娱乐型", "声控型"],
    priceMin: 25,
    priceMax: 45,
    nightPackPrice: "200-260元/8小时",
    tags: ["声音好听", "可语音试音", "聊天搞笑", "小姐姐/小哥哥可选"],
    reviews: {
      good: ["声音治愈", "氛围好", "态度温柔"],
      bad: ["纯上分能力一般"]
    },
    timeSlots: ["evening", "night", "afternoon"],
    highlight: "偏娱乐与声控，适合放松聊天、轻度游戏"
  },
  {
    id: 7,
    name: "原神探索陪玩团",
    games: ["原神"],
    styles: ["娱乐型", "教学型"],
    priceMin: 28,
    priceMax: 48,
    nightPackPrice: null,
    tags: ["带刷副本", "探索解谜", "角色培养指导", "可语音试音"],
    reviews: {
      good: ["熟悉地图与机制", "耐心讲解"],
      bad: ["高峰时段回复稍慢"]
    },
    timeSlots: ["afternoon", "evening", "night"],
    highlight: "原神专属，探索、副本、养成一站式"
  },
  {
    id: 8,
    name: "APEX猎杀者俱乐部",
    games: ["Apex英雄", "绝地求生"],
    styles: ["技术型"],
    priceMin: 40,
    priceMax: 70,
    nightPackPrice: "300-380元/8小时",
    tags: ["高KD认证", "可指定传奇", "枪法教学", "支持双排/三排"],
    reviews: {
      good: ["枪法准", "意识好", "吃鸡率高"],
      bad: ["价格偏高"]
    },
    timeSlots: ["night", "evening", "24h"],
    highlight: "FPS 射击类技术陪玩，适合冲分与练枪"
  },
  {
    id: 9,
    name: "王者荣耀速升站",
    games: ["王者荣耀"],
    styles: ["技术型", "娱乐型"],
    priceMin: 30,
    priceMax: 50,
    nightPackPrice: "220-280元/8小时",
    tags: ["可指定段位", "分路专精", "支持包夜", "可语音试音"],
    reviews: {
      good: ["带飞稳", "沟通及时"],
      bad: ["低价位陪玩水平参差"]
    },
    timeSlots: ["evening", "night", "24h"],
    highlight: "王者上分性价比之选，晚间档充足"
  },
  {
    id: 10,
    name: "全能电竞陪玩中心",
    games: ["英雄联盟", "王者荣耀", "永劫无间", "原神", "Apex英雄", "绝地求生"],
    styles: ["技术型", "娱乐型", "教学型", "声控型"],
    priceMin: 35,
    priceMax: 60,
    nightPackPrice: "280-360元/8小时",
    tags: ["24小时在线", "多游戏覆盖", "可语音试音", "平台担保交易", "支持包夜"],
    reviews: {
      good: ["选择多", "客服响应快", "流程规范"],
      bad: ["热门游戏需排队"]
    },
    timeSlots: ["morning", "afternoon", "evening", "night", "24h"],
    highlight: "多游戏一站式，不确定玩什么时的好选择"
  }
];

const GAME_OPTIONS = [
  "永劫无间",
  "英雄联盟",
  "王者荣耀",
  "原神",
  "Apex英雄",
  "绝地求生",
  "CS2",
  "Valorant",
  "其他"
];

const STYLE_OPTIONS = [
  { value: "技术型", label: "技术型（带飞/上分）" },
  { value: "娱乐型", label: "娱乐型（聊天/搞笑）" },
  { value: "声控型", label: "声控型（声音好听）" },
  { value: "教学型", label: "教学型（指导提升）" }
];

const TIME_OPTIONS = [
  { value: "morning", label: "上午 (8:00-12:00)" },
  { value: "afternoon", label: "下午 (12:00-18:00)" },
  { value: "evening", label: "傍晚 (18:00-22:00)" },
  { value: "night", label: "深夜 (22:00-02:00)" },
  { value: "24h", label: "24小时均可" }
];

const BUDGET_OPTIONS = [
  { value: "low", label: "30元/小时以内", max: 30 },
  { value: "medium", label: "30-50元/小时", max: 50 },
  { value: "high", label: "50-70元/小时", max: 70 },
  { value: "any", label: "不限预算", max: Infinity }
];

const TIME_LABELS = {
  morning: "上午",
  afternoon: "下午",
  evening: "傍晚",
  night: "深夜",
  "24h": "24小时"
};
