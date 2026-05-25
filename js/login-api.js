(function () {
  const AUTH_KEY = "pw_user";
  const DEMO_CODE = window.AccountStore?.DEMO_CODE || "888888";

  const USER_RECORDS = [
    {
      username: "zhj",
      password: "zhj0113190039",
      role: "admin",
      displayName: "系统管理员"
    },
    {
      username: "demo",
      password: "123456",
      role: "user",
      displayName: "演示用户"
    }
  ];

  function createSession(account, method, phone) {
    return {
      username: account.username,
      displayName: account.displayName || account.username,
      role: account.role || "user",
      method,
      phone: phone || null,
      loginAt: Date.now()
    };
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }

  function clearSession() {
    sessionStorage.removeItem(AUTH_KEY);
  }

  function isValidPhone(phone) {
    return /^1\d{10}$/.test(phone);
  }

  function isValidCode(code) {
    return /^\d{6}$/.test(code);
  }

  function findAccount(username) {
    if (window.AccountStore?.findAccount) {
      return window.AccountStore.findAccount(username);
    }

    return USER_RECORDS.find((account) => account.username === username) || null;
  }

  function authenticateAccount(username, password) {
    if (window.AccountStore?.authenticateAccount) {
      return window.AccountStore.authenticateAccount(username, password);
    }

    const account = findAccount(username);
    if (account) {
      return account.password === password ? account : null;
    }
    if (password.length >= 6) {
      return { username, password: "", role: "user", displayName: username };
    }
    return null;
  }

  async function loginWithPassword(username, password) {
    if (!username || !password) {
      return { success: false, error: "请输入账号和密码" };
    }

    const account = authenticateAccount(username, password);
    if (!account) {
      return { success: false, error: "账号或密码错误" };
    }

    return {
      success: true,
      session: createSession(account, "account")
    };
  }

  function sendVerificationCode(phone) {
    if (!isValidPhone(phone)) {
      return { success: false, error: "请输入正确的11位手机号" };
    }
    return {
      success: true,
      message: `验证码已发送（演示） · 演示验证码：${DEMO_CODE}`
    };
  }

  function loginWithPhone(phone, code) {
    if (!isValidPhone(phone)) {
      return { success: false, error: "请输入正确的11位手机号" };
    }
    if (!isValidCode(code)) {
      return { success: false, error: "请输入6位验证码" };
    }
    if (code !== DEMO_CODE) {
      return { success: false, error: "验证码错误，演示验证码为 888888" };
    }

    return {
      success: true,
      session: createSession({ username: phone, displayName: maskPhone(phone), role: "user" }, "phone", phone)
    };
  }

  function maskPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }

  window.LoginAPI = {
    loginWithPassword,
    sendVerificationCode,
    loginWithPhone,
    getSession,
    saveSession,
    clearSession,
    DEMO_CODE
  };
})();
