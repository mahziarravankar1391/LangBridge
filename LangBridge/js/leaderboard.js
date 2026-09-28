/* ============================================
   LangBridge - رتبه‌بندی
   ============================================ */
window.LBLeaderboard = (function() {

  function init() {
    renderLeaderboard();
  }

  function renderLeaderboard() {
    const container = document.getElementById('leaderboard-content');
    if (!container) return;

    const users = LBStorage.getUsers();
    const currentUserId = LBAuth.getCurrentUser()?.id;

    // محاسبه امتیاز هر کاربر
    const scores = users.map(u => {
      const results = LBStorage.getQuizResults(u.id);
      const cards = LBStorage.getFlashcards(u.id);
      const log = LBStorage.getStudyLog(u.id);

      const quizPoints = results.reduce((s, r) => s + r.score, 0);
      const wordPoints = cards.filter(c => c.learned).length * 5;
      const studyPoints = Math.floor(log.reduce((s, l) => s + l.minutes, 0) / 10);

      return {
        id: u.id,
        name: u.name,
        grade: u.grade,
        points: quizPoints + wordPoints + studyPoints,
        quizCount: results.length,
        wordsLearned: cards.filter(c => c.learned).length
      };
    }).sort((a, b) => b.points - a.points);

    // رتبه‌بندی بر اساس پایه
    const byGrade = {};
    [7, 8, 9].forEach(g => {
      byGrade[g] = scores.filter(s => s.grade === g);
    });

    const currentUserRank = scores.findIndex(s => s.id === currentUserId) + 1;

    container.innerHTML = `
      <div class="container" style="padding-top:100px">
        <h2 style="margin-bottom:1.5rem">🏆 رتبه‌بندی</h2>

        ${currentUserRank > 0 ? `
          <div class="card" style="margin-bottom:2rem;border:2px solid var(--primary)">
            <div style="display:flex;align-items:center;gap:1rem">
              <div style="font-size:2rem;font-weight:800;color:var(--primary)">#${currentUserRank}</div>
              <div>
                <div style="font-weight:700">رتبه شما</div>
                <div style="color:var(--text-secondary)">${scores[currentUserRank - 1]?.points || 0} امتیاز</div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="tabs">
          <button class="tab active" onclick="LBLeaderboard.showGrade(7)">هفتم</button>
          <button class="tab" onclick="LBLeaderboard.showGrade(8)">هشتم</button>
          <button class="tab" onclick="LBLeaderboard.showGrade(9)">نهم</button>
        </div>

        <div id="leaderboard-list">
          ${renderGradeLeaderboard(byGrade[7], currentUserId)}
        </div>
      </div>
    `;
  }

  function showGrade(grade) {
    const users = LBStorage.getUsers();
    const currentUserId = LBAuth.getCurrentUser()?.id;

    const scores = users.map(u => {
      const results = LBStorage.getQuizResults(u.id);
      const cards = LBStorage.getFlashcards(u.id);
      const log = LBStorage.getStudyLog(u.id);

      const quizPoints = results.reduce((s, r) => s + r.score, 0);
      const wordPoints = cards.filter(c => c.learned).length * 5;
      const studyPoints = Math.floor(log.reduce((s, l) => s + l.minutes, 0) / 10);

      return {
        id: u.id,
        name: u.name,
        grade: u.grade,
        points: quizPoints + wordPoints + studyPoints,
        quizCount: results.length,
        wordsLearned: cards.filter(c => c.learned).length
      };
    }).filter(s => s.grade === grade).sort((a, b) => b.points - a.points);

    document.getElementById('leaderboard-list').innerHTML = renderGradeLeaderboard(scores, currentUserId);

    // تغییر تب فعال
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
  }

  function renderGradeLeaderboard(scores, currentUserId) {
    if (scores.length === 0) {
      return '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>هنوز کاربری در این پایه ثبت نشده</p></div>';
    }

    return `
      <div class="card">
        ${scores.map((s, i) => {
          const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
          const isCurrentUser = s.id === currentUserId;
          return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
              <div class="leaderboard-rank ${rankClass}">${i + 1}</div>
              <div class="leaderboard-info">
                <div class="leaderboard-name">${s.name}</div>
                <div class="leaderboard-grade">${s.quizCount} آزمون | ${s.wordsLearned} واژه</div>
              </div>
              <div class="leaderboard-points">${s.points}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return { init, showGrade };
})();
