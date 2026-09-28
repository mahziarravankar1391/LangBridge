/* ============================================
   LangBridge - مدیریت ذخیره‌سازی محلی
   ============================================ */
window.LBStorage = (function() {
  const PREFIX = 'langbridge_';

  function get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }

  // ---------- کاربران ----------
  function getUsers() {
    return get('users', []);
  }

  function saveUsers(users) {
    return set('users', users);
  }

  function findUserByEmail(email) {
    return getUsers().find(u => u.email === email.toLowerCase().trim()) || null;
  }

  function findUserById(id) {
    return getUsers().find(u => u.id === id) || null;
  }

  function addUser(user) {
    const users = getUsers();
    users.push(user);
    return saveUsers(users);
  }

  function updateUser(id, data) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...data };
    return saveUsers(users);
  }

  function deleteUser(id) {
    const users = getUsers().filter(u => u.id !== id);
    saveUsers(users);
    // حذف همه داده‌های کاربر
    remove('quiz_results_' + id);
    remove('flashcards_' + id);
    remove('study_log_' + id);
    remove('goals_' + id);
    remove('decks_' + id);
  }

  // ---------- نشست ----------
  function getSession() {
    return get('session', null);
  }

  function setSession(userId) {
    return set('session', { userId, createdAt: Date.now() });
  }

  function clearSession() {
    remove('session');
  }

  // ---------- نتایج آزمون ----------
  function getQuizResults(userId) {
    return get('quiz_results_' + userId, []);
  }

  function saveQuizResult(userId, result) {
    const results = getQuizResults(userId);
    results.unshift(result);
    // فقط ۵۰ نتیجه آخر
    if (results.length > 50) results.length = 50;
    return set('quiz_results_' + userId, results);
  }

  // ---------- فلش‌کارت‌ها ----------
  function getFlashcards(userId) {
    return get('flashcards_' + userId, []);
  }

  function saveFlashcards(userId, cards) {
    return set('flashcards_' + userId, cards);
  }

  // ---------- لاگ مطالعه ----------
  function getStudyLog(userId) {
    return get('study_log_' + userId, []);
  }

  function logStudyTime(userId, minutes) {
    const log = getStudyLog(userId);
    const today = new Date().toISOString().split('T')[0];
    const existing = log.find(l => l.date === today);
    if (existing) {
      existing.minutes += minutes;
    } else {
      log.push({ date: today, minutes });
    }
    // فقط ۹۰ روز آخر
    if (log.length > 90) log.splice(0, log.length - 90);
    return set('study_log_' + userId, log);
  }

  function getTodayStudyTime(userId) {
    const today = new Date().toISOString().split('T')[0];
    const log = getStudyLog(userId);
    const entry = log.find(l => l.date === today);
    return entry ? entry.minutes : 0;
  }

  function getWeekStudyTime(userId) {
    const log = getStudyLog(userId);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const cutoff = weekAgo.toISOString().split('T')[0];
    return log.filter(l => l.date >= cutoff).reduce((sum, l) => sum + l.minutes, 0);
  }

  // ---------- اهداف ----------
  function getDailyGoal(userId) {
    return get('goals_' + userId, { minutes: 30 });
  }

  function setDailyGoal(userId, minutes) {
    return set('goals_' + userId, { minutes });
  }

  // ---------- پشتیبان‌گیری ----------
  function exportAll(userId) {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: findUserById(userId),
      quizResults: getQuizResults(userId),
      flashcards: getFlashcards(userId),
      studyLog: getStudyLog(userId),
      goals: getDailyGoal(userId),
    };
    return JSON.stringify(data, null, 2);
  }

  function importAll(userId, jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return { success: false, error: 'فایل نامعتبر است' };
      if (data.version !== '1.0') return { success: false, error: 'نسخه فایل پشتیبان پشتیبانی نمی‌شود' };

      if (data.quizResults) set('quiz_results_' + userId, data.quizResults);
      if (data.flashcards) set('flashcards_' + userId, data.flashcards);
      if (data.studyLog) set('study_log_' + userId, data.studyLog);
      if (data.goals) set('goals_' + userId, data.goals);

      return { success: true };
    } catch (e) {
      return { success: false, error: 'خطا در خواندن فایل: ' + e.message };
    }
  }

  // ---------- آمار ----------
  function getStats(userId) {
    const results = getQuizResults(userId);
    const cards = getFlashcards(userId);
    const log = getStudyLog(userId);

    const totalQuizzes = results.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalQuizzes)
      : 0;
    const totalWords = cards.filter(c => c.learned).length;
    const totalStudyTime = log.reduce((s, l) => s + l.minutes, 0);

    // استریک مطالعه
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = log.find(l => l.date === dateStr);
      if (entry && entry.minutes > 0) {
        streak++;
      } else {
        break;
      }
    }

    return { totalQuizzes, avgScore, totalWords, studyStreak: streak, totalStudyTime };
  }

  // ---------- هش رمز عبور ----------
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'langbridge_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ---------- اعتبارسنجی ----------
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    return password.length >= 8 && /\d/.test(password);
  }

  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  return {
    get, set, remove, clear,
    getUsers, saveUsers, findUserByEmail, findUserById, addUser, updateUser, deleteUser,
    getSession, setSession, clearSession,
    getQuizResults, saveQuizResult,
    getFlashcards, saveFlashcards,
    getStudyLog, logStudyTime, getTodayStudyTime, getWeekStudyTime,
    getDailyGoal, setDailyGoal,
    exportAll, importAll,
    getStats,
    hashPassword,
    validateEmail, validatePassword, sanitizeHTML, generateId
  };
})();
