/* ============================================
   LangBridge - هسته اصلی برنامه
   ============================================ */
window.LBApp = (function() {
  let currentUser = null;
  let currentPage = 'home';

  // ---------- روتر ----------
  function init() {
    loadTheme();
    checkAuth();
    setupNavigation();
    route();
    window.addEventListener('hashchange', route);
  }

  function route() {
    const hash = window.location.hash.slice(1) || 'home';
    const [page, ...params] = hash.split('/');
    currentPage = page;

    const publicPages = ['home', 'login', 'register'];
    if (!publicPages.includes(page) && !LBAuth.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    if (page === 'login' && LBAuth.isAuthenticated()) {
      window.location.hash = '#/dashboard';
      return;
    }

    renderPage(page, params);
    updateNavbar();
  }

  function navigate(path) {
    window.location.hash = '#/' + path;
  }

  // ---------- احراز هویت ----------
  function checkAuth() {
    const session = LBStorage.getSession();
    if (session) {
      currentUser = LBStorage.findUserById(session.userId);
      if (!currentUser) {
        LBStorage.clearSession();
        currentUser = null;
      }
    }
  }

  function getCurrentUser() {
    return currentUser;
  }

  // ---------- رندر صفحات ----------
  function renderPage(page, params) {
    const app = document.getElementById('app');
    if (!app) return;

    const pages = {
      home: renderHome,
      login: renderLogin,
      register: renderRegister,
      dashboard: renderDashboard,
      quiz: () => renderQuiz(params),
      flashcards: renderFlashcards,
      leaderboard: renderLeaderboard,
      profile: renderProfile,
      admin: renderAdmin,
      backup: renderBackup,
    };

    const renderer = pages[page] || renderHome;
    app.innerHTML = '';
    const content = renderer(params);
    if (typeof content === 'string') {
      app.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      app.appendChild(content);
    }

    // اجرای اسکریپت صفحه
    if (page === 'quiz' && window.LBQuiz) LBQuiz.init(params);
    if (page === 'flashcards' && window.LBFlashcards) LBFlashcards.init();
    if (page === 'dashboard' && window.LBDashboard) LBDashboard.init();
    if (page === 'admin' && window.LBAdmin) LBAdmin.init();
    if (page === 'leaderboard' && window.LBLeaderboard) LBLeaderboard.init();
    if (page === 'profile') initProfile();
    if (page === 'backup') initBackup();
  }

  // ---------- صفحه اصلی ----------
  function renderHome() {
    const isAuth = LBAuth.isAuthenticated();
    return `
      <div class="hero">
        <div class="container">
          <h1>🌉 LangBridge</h1>
          <p class="hero-subtitle">سامانه جامع آموزش زبان انگلیسی</p>
          <p class="hero-desc">پایه‌های هفتم، هشتم و نهم | آزمون هفتگی | فلش‌کارت | رتبه‌بندی</p>
          <div class="hero-actions">
            ${isAuth
              ? `<button class="btn btn-primary btn-lg" onclick="LBApp.navigate('dashboard')">ورود به داشبورد</button>`
              : `<button class="btn btn-primary btn-lg" onclick="LBApp.navigate('register')">شروع رایگان</button>
                 <button class="btn btn-outline btn-lg" onclick="LBApp.navigate('login')">ورود</button>`
            }
          </div>
        </div>
      </div>
      <div class="container">
        <div class="features-grid">
          <div class="card feature-card">
            <div class="feature-icon">📝</div>
            <h3>آزمون هفتگی</h3>
            <p>آزمون‌های زمان‌دار با سؤالات چندگزینه‌ای، درست و غلط و پاسخ کوتاه</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">🃏</div>
            <h3>فلش‌کارت هوشمند</h3>
            <p>سیستم مرور فاصله‌دار برای یادگیری بهتر واژگان</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">🏆</div>
            <h3>رتبه‌بندی</h3>
            <p>جدول امتیازات هفتگی و کلی برای هر پایه تحصیلی</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">📊</div>
            <h3>داشبورد پیشرفت</h3>
            <p>نمودار پیشرفت، آمار مطالعه و نقاط قوت و ضعف</p>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- ورود ----------
  function renderLogin() {
    return `
      <div class="auth-page">
        <div class="card auth-card">
          <h2>ورود به حساب</h2>
          <form id="login-form" onsubmit="return LBAuth.handleLogin(event)">
            <div class="form-group">
              <label for="email">ایمیل</label>
              <input type="email" id="email" required placeholder="example@email.com">
            </div>
            <div class="form-group">
              <label for="password">رمز عبور</label>
              <input type="password" id="password" required placeholder="••••••••">
            </div>
            <div id="login-error" class="form-error"></div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">ورود</button>
          </form>
          <p style="text-align:center;margin-top:1rem">
            حساب ندارید؟ <a href="#/register">ثبت‌نام کنید</a>
          </p>
        </div>
      </div>
    `;
  }

  // ---------- ثبت‌نام ----------
  function renderRegister() {
    return `
      <div class="auth-page">
        <div class="card auth-card">
          <h2>ثبت‌نام رایگان</h2>
          <form id="register-form" onsubmit="return LBAuth.handleRegister(event)">
            <div class="form-group">
              <label for="name">نام و نام خانوادگی</label>
              <input type="text" id="name" required minlength="2" placeholder="علی محمدی">
            </div>
            <div class="form-group">
              <label for="email">ایمیل</label>
              <input type="email" id="email" required placeholder="example@email.com">
            </div>
            <div class="form-group">
              <label for="password">رمز عبور (حداقل ۸ کاراکتر با عدد)</label>
              <input type="password" id="password" required minlength="8" placeholder="••••••••">
            </div>
            <div class="form-group">
              <label for="grade">پایه تحصیلی</label>
              <select id="grade" required>
                <option value="">انتخاب کنید</option>
                <option value="7">هفتم</option>
                <option value="8">هشتم</option>
                <option value="9">نهم</option>
              </select>
            </div>
            <div id="register-error" class="form-error"></div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">ثبت‌نام</button>
          </form>
          <p style="text-align:center;margin-top:1rem">
            حساب دارید؟ <a href="#/login">ورود کنید</a>
          </p>
        </div>
      </div>
    `;
  }

  // ---------- داشبورد ----------
  function renderDashboard() {
    return `<div id="dashboard-content"><div class="loading"><div class="spinner"></div></div></div>`;
  }

  // ---------- آزمون ----------
  function renderQuiz(params) {
    return `<div id="quiz-content"><div class="loading"><div class="spinner"></div></div></div>`;
  }

  // ---------- فلش‌کارت ----------
  function renderFlashcards() {
    return `<div id="flashcards-content"><div class="loading"><div class="spinner"></div></div></div>`;
  }

  // ---------- رتبه‌بندی ----------
  function renderLeaderboard() {
    return `<div id="leaderboard-content"><div class="loading"><div class="spinner"></div></div></div>`;
  }

  // ---------- پروفایل ----------
  function renderProfile() {
    return `<div id="profile-content"><div class="loading"><div class="spinner"></div></div></div>`;
  }

  // ---------- ادمین ----------
  function renderAdmin() {
    return `<div id="admin-content"><div class="loading"><div class="spinner"></div></div></div>`;
  }

  // ---------- پشتیبان‌گیری ----------
  function renderBackup() {
    return `<div id="backup-content"><div class="loading"><div class="spinner"></div></div></div>`;
  }

  // ---------- ناوبری ----------
  function setupNavigation() {
    const toggle = document.getElementById('nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.getElementById('nav-menu')?.classList.toggle('mobile-open');
      });
    }
  }

  function updateNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const isAuth = LBAuth.isAuthenticated();
    const user = LBAuth.getCurrentUser();

    navbar.innerHTML = `
      <a href="#/home" class="navbar-brand">🌉 Lang<span>Bridge</span></a>
      <ul class="navbar-nav" id="nav-menu">
        <li><a href="#/home" class="${currentPage === 'home' ? 'active' : ''}">خانه</a></li>
        ${isAuth ? `
          <li><a href="#/dashboard" class="${currentPage === 'dashboard' ? 'active' : ''}">داشبورد</a></li>
          <li><a href="#/quiz" class="${currentPage === 'quiz' ? 'active' : ''}">آزمون</a></li>
          <li><a href="#/flashcards" class="${currentPage === 'flashcards' ? 'active' : ''}">فلش‌کارت</a></li>
          <li><a href="#/leaderboard" class="${currentPage === 'leaderboard' ? 'active' : ''}">رتبه‌بندی</a></li>
          ${user?.isAdmin ? `<li><a href="#/admin" class="${currentPage === 'admin' ? 'active' : ''}">مدیریت</a></li>` : ''}
        ` : ''}
      </ul>
      <div class="navbar-actions">
        <button class="btn-icon" onclick="LBApp.toggleTheme()" title="تغییر تم">🌓</button>
        ${isAuth ? `
          <div class="navbar-user">
            <div class="navbar-avatar">${user?.name?.charAt(0) || '؟'}</div>
            <span>${user?.name || ''}</span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="LBAuth.handleLogout()">خروج</button>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="LBApp.navigate('login')">ورود</button>
        `}
        <button class="btn-icon" id="nav-toggle" style="display:none">☰</button>
      </div>
    `;

    // نمایش دکمه منو در موبایل
    if (window.innerWidth <= 768) {
      const toggleBtn = document.getElementById('nav-toggle');
      if (toggleBtn) toggleBtn.style.display = 'inline-flex';
    }
  }

  // ---------- تم ----------
  function loadTheme() {
    const saved = localStorage.getItem('langbridge_theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('langbridge_theme', next);
  }

  // ---------- اعلان ----------
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ---------- مودال ----------
  function openModal(title, content) {
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="LBApp.closeModal()">×</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    `;
    overlay.classList.add('active');
  }

  function closeModal() {
    document.querySelector('.modal-overlay')?.classList.remove('active');
  }

  // ---------- اجرا ----------
  document.addEventListener('DOMContentLoaded', init);

  return {
    init, navigate, route, getCurrentUser,
    showToast, openModal, closeModal, toggleTheme, updateNavbar
  };
})();
