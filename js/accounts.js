/** 账户配置 — 演示用，正式环境应接入后端鉴权 */
const ACCOUNTS = {
  admin: {
    username: "zhj",
    password: "zhj0113190039",
    role: "admin",
    displayName: "系统管理员"
  },
  demo: {
    username: "demo",
    password: "123456",
    role: "user",
    displayName: "演示用户"
  }
};

const DEMO_CODE = "888888";

function findAccount(username) {
  return Object.values(ACCOUNTS).find((a) => a.username === username) || null;
}

function authenticateAccount(username, password) {
  const account = findAccount(username);
  if (account) {
    return account.password === password ? account : null;
  }
  if (password.length >= 6) {
    return { username, password: "", role: "user", displayName: username };
  }
  return null;
}
