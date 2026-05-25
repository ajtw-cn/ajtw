(function () {
  const AUTH_KEY = "pw_user";
  const DEMO_CODE = "888888";

  const USER_RECORDS = [
    {
      username: "zhj",
      passwordHash: "338f91960022550c8abaa1edcab9866fcbb24af15ad13ff0e8c4ddb1aec5fdb5",
      role: "admin",
      displayName: "系统管理员"
    },
    {
      username: "demo",
      passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
      role: "user",
      displayName: "演示用户"
    }
  ];

  async function hashPassword(password) {
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(password)
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function authenticateAccount(username, password) {
    const record = USER_RECORDS.find((account) => account.username === username);
    if (record) {
      if ((await hashPassword(password)) !== record.passwordHash) {
        return null;
      }
      return {
        username: record.username,
        role: record.role,
        displayName: record.displayName
      };
    }
    if (password.length >= 6) {
      return { username, role: "user", displayName: username };
    }
    return null;
  }

  const form = document.getElementById("loginForm");
  const tabs = document.querySelectorAll(".login-tab");
  const accountPanel = document.getElementById("accountPanel");
  const phonePanel = document.getElementById("phonePanel");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const sendCodeBtn = document.getElementById("sendCodeBtn");
  const demoLoginBtn = document.getElementById("demoLogin");
  const loginTip = document.getElementById("loginTip");
  const forgotLink = document.getElementById("forgotLink");
  const registerLink = document.getElementById("registerLink");

  let activeTab = "account";
  let codeCountdown = 0;
  let countdownTimer = null;

  if (getSession()) {
    redirectByRole(getSession());
    return;
  }

  restoreRememberedUsername();

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.textContent = isHidden ? "🙈" : "👁";
    togglePassword.setAttribute("aria-label", isHidden ? "隐藏密码" : "显示密码");
  });

  sendCodeBtn.addEventListener("click", handleSendCode);

  demoLoginBtn.addEventListener("click", () => {
    document.getElementById("username").value = "demo";
    passwordInput.value = "123456";
    switchTab("account");
    clearErrors();
    doLogin(buildSession(
      { username: "demo", displayName: "演示用户", role: "user" },
      "account"
    ));
  });

  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    showTip("演示项目暂未接入找回密码，请联系平台客服。", "error");
  });

  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    showTip("注册功能开发中，可先使用演示账号体验。", "error");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    clearTip();

    if (activeTab === "account") {
      submitAccountLogin();
    } else {
      submitPhoneLogin();
    }
  });

  function switchTab(tab) {
    activeTab = tab;
    tabs.forEach((el) => {
      const isActive = el.dataset.tab === tab;
      el.classList.toggle("active", isActive);
      el.setAttribute("aria-selected", String(isActive));
    });
    accountPanel.hidden = tab !== "account";
    phonePanel.hidden = tab !== "phone";
    clearErrors();
    clearTip();
  }

  async function submitAccountLogin() {
    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value;

    let valid = true;
    if (!username) {
      setError("usernameError", "请输入账号");
      valid = false;
    }
    if (!password) {
      setError("passwordError", "请输入密码");
      valid = false;
    } else if (password.length < 6) {
      setError("passwordError", "密码至少 6 位");
      valid = false;
    }

    if (!valid) return;

    const account = await authenticateAccount(username, password);
    if (!account) {
      setError("passwordError", "账号或密码错误");
      return;
    }

    if (document.getElementById("remember").checked) {
      localStorage.setItem("pw_remember_user", username);
    } else {
      localStorage.removeItem("pw_remember_user");
    }

    doLogin(buildSession(account, "account"));
  }

  function submitPhoneLogin() {
    const phone = document.getElementById("phone").value.trim();
    const code = document.getElementById("code").value.trim();

    let valid = true;
    if (!/^1\d{10}$/.test(phone)) {
      setError("phoneError", "请输入正确的11位手机号");
      valid = false;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("codeError", "请输入6位验证码");
      valid = false;
    } else if (code !== DEMO_CODE) {
      setError("codeError", "验证码错误，演示验证码为 888888");
      valid = false;
    }

    if (!valid) return;

    doLogin({
      username: maskPhone(phone),
      displayName: maskPhone(phone),
      role: "user",
      method: "phone",
      phone
    });
  }

  function buildSession(account, method, phone) {
    return {
      username: account.username,
      displayName: account.displayName || account.username,
      role: account.role || "user",
      method,
      phone: phone || null,
      loginAt: Date.now()
    };
  }

  function handleSendCode() {
    const phone = document.getElementById("phone").value.trim();
    if (!/^1\d{10}$/.test(phone)) {
      setError("phoneError", "请先输入正确的手机号");
      return;
    }
    if (codeCountdown > 0) return;

    codeCountdown = 60;
    sendCodeBtn.disabled = true;
    sendCodeBtn.textContent = `${codeCountdown}s 后重发`;

    showTip(`验证码已发送（演示） · 演示验证码：${DEMO_CODE}`, "success");

    countdownTimer = setInterval(() => {
      codeCountdown -= 1;
      if (codeCountdown <= 0) {
        clearInterval(countdownTimer);
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = "获取验证码";
      } else {
        sendCodeBtn.textContent = `${codeCountdown}s 后重发`;
      }
    }, 1000);
  }

  function doLogin(session) {
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.disabled = true;
    loginBtn.textContent = "登录中…";

    const isAdmin = session.role === "admin";

    setTimeout(() => {
      saveSession(session);
      showTip(
        isAdmin ? "管理员登录成功，正在进入管理后台…" : "登录成功，正在跳转…",
        "success"
      );
      setTimeout(() => redirectByRole(session), 600);
    }, 500);
  }

  function redirectByRole(session) {
    window.location.href = session.role === "admin" ? "admin.html" : "index.html";
  }

  function saveSession(user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  }

  function restoreRememberedUsername() {
    const saved = localStorage.getItem("pw_remember_user");
    if (saved) {
      document.getElementById("username").value = saved;
      document.getElementById("remember").checked = true;
    }
  }

  function maskPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }

  function setError(id, msg) {
    document.getElementById(id).textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
    });
  }

  function showTip(msg, type) {
    loginTip.textContent = msg;
    loginTip.className = "login-tip" + (type ? ` ${type}` : "");
  }

  function clearTip() {
    loginTip.textContent = "";
    loginTip.className = "login-tip";
  }
})();
