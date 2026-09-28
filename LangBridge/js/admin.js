/* ============================================
   LangBridge - پنل مدیریت
   ============================================ */
window.LBAdmin = (function() {
  let currentTab = 'overview';

  function init() {
    const user = LBAuth.getCurrentUser();
    if (!user || !user.isAdmin) {
      document.getElementById('admin-content').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔒</div><p>دسترسی به پنل مدیریت محدود است</p></div>';
      return;
    }
    renderAdmin();
  }

  function renderAdmin() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
      <div class="container" style="padding-top:100px">
        <h2 style="margin-bottom:1.5rem">پنل مدیریت</h2>
        <div class="admin-grid">
          <div class="admin-sidebar">
            <ul class="admin-menu">
              <li><a href="#" class="${currentTab === 'overview' ? 'active' : ''}" onclick="LBAdmin.switchTab('overview')">📊 نمای کلی</a></li>
              <li><a href="#" class="${currentTab === 'users' ? 'active' : ''}" onclick="LBAdmin.switchTab('users')">👥 کاربران</a></li>
              <li><a href="#" class="${currentTab === 'quizzes' ? 'active' : ''}" onclick="LBAdmin.switchTab('quizzes')">📝 آزمون‌ها</a></li>
              <li><a href="#" class="${currentTab === 'content' ? 'active' : ''}" onclick="LBAdmin.switchTab('content')">📚 محتوا</a></li>
              <li><a href="#" class="${currentTab === 'settings' ? 'active' : ''}" onclick="LBAdmin.switchTab('settings')">⚙️ تنظیمات</a></li>
            </ul>
          </div>
          <div class="admin-content" id="admin-tab-content"></div>
        </div>
      </div>
    `;

    renderTab();
  }

  function switchTab(tab) {
    currentTab = tab;
    renderAdmin();
  }

  function renderTab() {
    const content = document.getElementById('admin-tab-content');
    if (!content) return;

    const tabs = {
      overview: renderOverview,
      users: renderUsers,
      quizzes: renderQuizzes,
      content: renderContent,
      settings: renderSettings
    };

    (tabs[currentTab] || renderOverview)(content);
  }

  // ---------- نمای کلی ----------
  function renderOverview(container) {
    const users = LBStorage.getUsers();
    const allResults = users.flatMap(u => LBStorage.getQuizResults(u.id));
    const avgScore = allResults.length > 0
      ? Math.round(allResults.reduce((s, r) => s + r.score, 0) / allResults.length)
      : 0;

    container.innerHTML = `
      <h3 style="margin-bottom:1.5rem">نمای کلی سامانه</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${users.length}</div>
          <div class="stat-label">کل کاربران</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${allResults.length}</div>
          <div class="stat-label">آزمون انجام‌شده</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgScore}٪</div>
          <div class="stat-label">میانگین نمره کل</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${users.filter(u => u.grade === 7).length}</div>
          <div class="stat-label">پایه هفتم</div>
        </div>
      </div>
    `;
  }

  // ---------- کاربران ----------
  function renderUsers(container) {
    const users = LBStorage.getUsers();

    container.innerHTML = `
      <h3 style="margin-bottom:1.5rem">مدیریت کاربران</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>نام</th>
              <th>ایمیل</th>
              <th>پایه</th>
              <th>تاریخ عضویت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="badge badge-primary">${u.grade}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString('fa-IR')}</td>
                <td>
                  <button class="btn btn-sm btn-danger" onclick="LBAdmin.deleteUser('${u.id}')">حذف</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function deleteUser(userId) {
    if (!confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
    LBStorage.deleteUser(userId);
    LBApp.showToast('کاربر حذف شد', 'info');
    renderAdmin();
  }

  // ---------- آزمون‌ها ----------
  function renderQuizzes(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1.5rem">مدیریت آزمون‌ها</h3>
      <div class="card">
        <p style="color:var(--text-secondary)">در نسخه کامل، امکان ساخت و ویرایش آزمون از اینجا فراهم است.</p>
        <p style="color:var(--text-muted);font-size:0.875rem">برای اتصال به پایگاه داده آنلاین، تنظیمات Supabase را تکمیل کنید.</p>
      </div>
    `;
  }

  // ---------- محتوا ----------
  function renderContent(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1.5rem">مدیریت محتوا</h3>
      <div class="card">
        <p style="color:var(--text-secondary)">مدیریت واژگان و درس‌ها از اینجا انجام می‌شود.</p>
      </div>
    `;
  }

  // ---------- تنظیمات ----------
  function renderSettings(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1.5rem">تنظیمات سامانه</h3>
      <div class="card">
        <div class="form-group">
          <label>نام سامانه</label>
          <input type="text" value="LangBridge" onchange="LBAdmin.updateSetting('siteName', this.value)">
        </div>
        <div class="form-group">
          <label>پیام اعلان</label>
          <textarea rows="3" onchange="LBAdmin.updateSetting('announcement', this.value)" placeholder="پیام نمایش داده شده به کاربران..."></textarea>
        </div>
        <button class="btn btn-primary" onclick="LBAdmin.saveSettings()">ذخیره تنظیمات</button>
      </div>
    `;
  }

  function updateSetting(key, value) {
    LBStorage.set('admin_settings_' + key, value);
  }

  function saveSettings() {
    LBApp.showToast('تنظیمات ذخیره شد', 'success');
  }

  return { init, switchTab, deleteUser, updateSetting, saveSettings };
})();
