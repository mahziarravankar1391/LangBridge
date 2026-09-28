/* ============================================
   LangBridge - احراز هویت
   ============================================ */
window.LBAuth = (function() {

  // ---------- ثبت‌نام ----------
  async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const grade = document.getElementById('grade').value;
    const errorEl = document.getElementById('register-error');

    // اعتبارسنجی
    if (name.length < 2) {
      errorEl.textContent = 'نام باید حداقل ۲ کاراکتر باشد';
      return false;
    }
    if (!LBStorage.validateEmail(email)) {
      errorEl.textContent = 'ایمیل معتبر نیست';
      return false;
    }
    if (!LBStorage.validatePassword(password)) {
      errorEl.textContent = 'رمز عبور باید حداقل ۸ کاراکتر و شامل عدد باشد';
      return false;
    }
    if (!grade) {
      errorEl.textContent = 'پایه تحصیلی را انتخاب کنید';
      return false;
    }

    // بررسی تکراری نبودن ایمیل
    if (LBStorage.findUserByEmail(email)) {
      errorEl.textContent = 'این ایمیل قبلاً ثبت شده است';
      return false;
    }

    // ساخت کاربر
    const passwordHash = await LBStorage.hashPassword(password);
    const user = {
      id: LBStorage.generateId(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      grade: parseInt(grade),
      avatar: null,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    LBStorage.addUser(user);
    LBStorage.setSession(user.id);
    LBApp.showToast('ثبت‌نام موفقیت‌آمیز بود!', 'success');
    LBApp.navigate('dashboard');
    return false;
  }

  // ---------- ورود ----------
  async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    if (!LBStorage.validateEmail(email)) {
      errorEl.textContent = 'ایمیل معتبر نیست';
      return false;
    }

    const user = LBStorage.findUserByEmail(email);
    if (!user) {
      errorEl.textContent = 'کاربری با این ایمیل یافت نشد';
      return false;
    }

    const passwordHash = await LBStorage.hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      errorEl.textContent = 'رمز عبور اشتباه است';
      return false;
    }

    user.lastLogin = new Date().toISOString();
    LBStorage.updateUser(user.id, { lastLogin: user.lastLogin });
    LBStorage.setSession(user.id);
    LBApp.showToast('خوش آمدید!', 'success');
    LBApp.navigate('dashboard');
    return false;
  }

  // ---------- خروج ----------
  function handleLogout() {
    LBStorage.clearSession();
    LBApp.showToast('با موفقیت خارج شدید', 'info');
    LBApp.navigate('home');
  }

  // ---------- بررسی وضعیت ----------
  function isAuthenticated() {
    const session = LBStorage.getSession();
    if (!session) return false;
    const user = LBStorage.findUserById(session.userId);
    return !!user;
  }

  function getCurrentUser() {
    const session = LBStorage.getSession();
    if (!session) return null;
    return LBStorage.findUserById(session.userId);
  }

  // ---------- ویرایش پروفایل ----------
  function updateProfile(data) {
    const user = getCurrentUser();
    if (!user) return false;
    LBStorage.updateUser(user.id, data);
    LBApp.showToast('پروفایل به‌روزرسانی شد', 'success');
    return true;
  }

  // ---------- تغییر رمز ----------
  async function changePassword(oldPass, newPass) {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'کاربر یافت نشد' };

    const oldHash = await LBStorage.hashPassword(oldPass);
    if (oldHash !== user.passwordHash) {
      return { success: false, error: 'رمز عبور فعلی اشتباه است' };
    }

    if (!LBStorage.validatePassword(newPass)) {
      return { success: false, error: 'رمز جدید باید حداقل ۸ کاراکتر و شامل عدد باشد' };
    }

    const newHash = await LBStorage.hashPassword(newPass);
    LBStorage.updateUser(user.id, { passwordHash: newHash });
    return { success: true };
  }

  // ---------- حذف حساب ----------
  async function deleteAccount(password) {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'کاربر یافت نشد' };

    const hash = await LBStorage.hashPassword(password);
    if (hash !== user.passwordHash) {
      return { success: false, error: 'رمز عبور اشتباه است' };
    }

    LBStorage.deleteUser(user.id);
    LBStorage.clearSession();
    return { success: true };
  }

  // ---------- بازیابی رمز ----------
  function requestPasswordReset(email) {
    const user = LBStorage.findUserByEmail(email);
    if (!user) {
      return { success: false, error: 'کاربری با این ایمیل یافت نشد' };
    }
    // در نسخه واقعی، ایمیل ارسال می‌شود. اینجا فقط UI
    return { success: true, message: 'لینک بازیابی به ایمیل شما ارسال شد (نسخه نمایشی)' };
  }

  return {
    handleRegister, handleLogin, handleLogout,
    isAuthenticated, getCurrentUser,
    updateProfile, changePassword, deleteAccount, requestPasswordReset
  };
})();
