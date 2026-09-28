/* ============================================
   LangBridge - داشبورد دانش‌آموز
   ============================================ */
window.LBDashboard = (function() {

  function init() {
    const user = LBAuth.getCurrentUser();
    if (!user) return;

    const stats = LBStorage.getStats(user.id);
    const results = LBStorage.getQuizResults(user.id);
    const cards = LBStorage.getFlashcards(user.id);
    const todayMinutes = LBStorage.getTodayStudyTime(user.id);
    const weekMinutes = LBStorage.getWeekStudyTime(user.id);
    const goal = LBStorage.getDailyGoal(user.id);

    // محاسبه رنگ نمودار
    const maxMinutes = Math.max(...getLast7Days().map(d => d.minutes), 1);

    document.getElementById('dashboard-content').innerHTML = `
      <div class="container" style="padding-top:100px">
        <div class="profile-header">
          <div class="profile-avatar">${user.name.charAt(0)}</div>
          <div class="profile-info">
            <h2>${user.name}</h2>
            <p>پایه ${user.grade} | عضویت: ${new Date(user.createdAt).toLocaleDateString('fa-IR')}</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalQuizzes}</div>
            <div class="stat-label">آزمون انجام‌شده</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.avgScore}٪</div>
            <div class="stat-label">میانگین نمره</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalWords}</div>
            <div class="stat-label">واژه یادگرفته</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.studyStreak}</div>
            <div class="stat-label">روز استریک</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
          <div class="chart-container">
            <h3 style="margin-bottom:1rem">مطالعه ۷ روز اخیر</h3>
            <div class="bar-chart">
              ${getLast7Days().map(d => `
                <div class="bar" style="height:${Math.max(4, (d.minutes / maxMinutes) * 100)}%" title="${d.label}: ${d.minutes} دقیقه">
                  <span class="bar-label">${d.label}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="chart-container">
            <h3 style="margin-bottom:1rem">هدف روزانه</h3>
            <div style="text-align:center;padding:2rem">
              <div style="font-size:3rem;font-weight:800;color:var(--primary)">${todayMinutes}</div>
              <div style="color:var(--text-secondary)">از ${goal.minutes} دقیقه</div>
              <div class="progress" style="margin-top:1rem">
                <div class="progress-bar ${todayMinutes >= goal.minutes ? 'success' : ''}" style="width:${Math.min(100, (todayMinutes / goal.minutes) * 100)}%"></div>
              </div>
              ${todayMinutes >= goal.minutes ? '<p style="color:var(--success);margin-top:0.5rem;font-weight:600">🎉 هدف امروز تحقق یافت!</p>' : ''}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
          <div class="card">
            <h3 style="margin-bottom:1rem">آخرین آزمون‌ها</h3>
            ${results.length === 0 ? '<p style="color:var(--text-muted)">هنوز آزمونی انجام نداده‌اید</p>' : results.slice(0, 5).map(r => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border)">
                <div>
                  <div style="font-weight:600">پایه ${r.grade} — هفته ${r.week}</div>
                  <div style="font-size:0.875rem;color:var(--text-muted)">${new Date(r.date).toLocaleDateString('fa-IR')}</div>
                </div>
                <span class="badge ${r.score >= 80 ? 'badge-success' : r.score >= 60 ? 'badge-warning' : 'badge-danger'}">${r.score}٪</span>
              </div>
            `).join('')}
          </div>
          <div class="card">
            <h3 style="margin-bottom:1rem">دسترسی سریع</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem">
              <button class="btn btn-primary" onclick="LBApp.navigate('quiz')">📝 شروع آزمون</button>
              <button class="btn btn-secondary" onclick="LBApp.navigate('flashcards')">🃏 مطالعه فلش‌کارت</button>
              <button class="btn btn-outline" onclick="LBApp.navigate('leaderboard')">🏆 رتبه‌بندی</button>
              <button class="btn btn-outline" onclick="LBApp.navigate('profile')">👤 ویرایش پروفایل</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function getLast7Days() {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const user = LBAuth.getCurrentUser();
      const log = LBStorage.getStudyLog(user.id);
      const entry = log.find(l => l.date === dateStr);
      days.push({
        label: d.toLocaleDateString('fa-IR', { weekday: 'short' }),
        minutes: entry ? entry.minutes : 0
      });
    }
    return days;
  }

  return { init };
})();
