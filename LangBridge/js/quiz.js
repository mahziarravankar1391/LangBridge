/* ============================================
   LangBridge - سیستم آزمون
   ============================================ */
window.LBQuiz = (function() {
  let currentQuiz = null;
  let timerInterval = null;
  let timeRemaining = 0;
  let answers = {};
  let submitted = false;

  // ---------- بانک سؤالات نمونه ----------
  const QUESTION_BANK = {
    7: [
      { id: 'q7_1', type: 'multiple_choice', question: 'What is the meaning of "apple"?', options: ['سیب', 'موز', 'پرتقال', 'انگور'], correctAnswer: 0, explanation: 'Apple یعنی سیب', topic: 'vocabulary', grade: 7 },
      { id: 'q7_2', type: 'multiple_choice', question: 'Which sentence is correct?', options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'], correctAnswer: 1, explanation: 'با فاعل سوم شخص مفرد، فعل به صورت goes استفاده می‌شود', topic: 'grammar', grade: 7 },
      { id: 'q7_3', type: 'true_false', question: '"Big" means "کوچک"', options: ['درست', 'غلط'], correctAnswer: 1, explanation: 'Big یعنی بزرگ، کوچک یعنی small', topic: 'vocabulary', grade: 7 },
      { id: 'q7_4', type: 'multiple_choice', question: 'What is the opposite of "hot"?', options: ['warm', 'cold', 'cool', 'heat'], correctAnswer: 1, explanation: 'Hot (داغ) عکس آن Cold (سرد) است', topic: 'vocabulary', grade: 7 },
      { id: 'q7_5', type: 'short_answer', question: 'Write the plural of "child"', options: [], correctAnswer: 'children', explanation: 'Child جمع آن children است (جمع نامنظم)', topic: 'grammar', grade: 7 },
      { id: 'q7_6', type: 'multiple_choice', question: 'What time is it? (ساعت ۳:۱۵)', options: ['It is three fifteen.', 'It is three fifty.', 'It is fifteen three.', 'It is three fifty-five.'], correctAnswer: 0, explanation: 'ساعت ۳:۱۵ به صورت three fifteen خوانده می‌شود', topic: 'vocabulary', grade: 7 },
      { id: 'q7_7', type: 'true_false', question: '"I am student" is correct English.', options: ['درست', 'غلط'], correctAnswer: 1, explanation: 'باید I am a student باشد (حرف تعریف a لازم است)', topic: 'grammar', grade: 7 },
      { id: 'q7_8', type: 'multiple_choice', question: 'Which word is a color?', options: ['run', 'blue', 'book', 'happy'], correctAnswer: 1, explanation: 'Blue یعنی آبی و یک رنگ است', topic: 'vocabulary', grade: 7 },
    ],
    8: [
      { id: 'q8_1', type: 'multiple_choice', question: 'What is the meaning of "improve"?', options: ['بهبود دادن', 'خراب کردن', 'نوشتن', 'خواندن'], correctAnswer: 0, explanation: 'Improve یعنی بهبود دادن', topic: 'vocabulary', grade: 8 },
      { id: 'q8_2', type: 'multiple_choice', question: 'Choose the correct sentence:', options: ['He have been working.', 'He has been working.', 'He is been working.', 'He was been working.'], correctAnswer: 1, explanation: 'Present Perfect Continuous با has been + ing', topic: 'grammar', grade: 8 },
      { id: 'q8_3', type: 'true_false', question: '"Although" and "but" can be used together in one sentence.', options: ['درست', 'غلط'], correctAnswer: 1, explanation: 'Although و but هر دو حرف ربط‌اند و با هم استفاده نمی‌شوند', topic: 'grammar', grade: 8 },
      { id: 'q8_4', type: 'multiple_choice', question: 'What is the past tense of "teach"?', options: ['teached', 'taught', 'teaching', 'teach'], correctAnswer: 1, explanation: 'Teach گذشته آن taught است (نامنظم)', topic: 'grammar', grade: 8 },
      { id: 'q8_5', type: 'short_answer', question: 'Write the comparative of "good"', options: [], correctAnswer: 'better', explanation: 'Good تفضیلی آن better است', topic: 'grammar', grade: 8 },
      { id: 'q8_6', type: 'multiple_choice', question: 'Which is a synonym of "happy"?', options: ['sad', 'angry', 'joyful', 'tired'], correctAnswer: 2, explanation: 'Joyful هم‌معنی happy است', topic: 'vocabulary', grade: 8 },
      { id: 'q8_7', type: 'true_false', question: '"If I were you" is grammatically correct.', options: ['درست', 'غلط'], correctAnswer: 0, explanation: 'در شرطی نوع دوم، were با I هم استفاده می‌شود', topic: 'grammar', grade: 8 },
      { id: 'q8_8', type: 'multiple_choice', question: 'What does "environment" mean?', options: ['محیط زیست', 'ماشین', 'مدرسه', 'بیمارستان'], correctAnswer: 0, explanation: 'Environment یعنی محیط زیست', topic: 'vocabulary', grade: 8 },
    ],
    9: [
      { id: 'q9_1', type: 'multiple_choice', question: 'What is the meaning of "achieve"?', options: ['دست یافتن', 'از دست دادن', 'شروع کردن', 'تمام کردن'], correctAnswer: 0, explanation: 'Achieve یعنی دست یافتن/محقق کردن', topic: 'vocabulary', grade: 9 },
      { id: 'q9_2', type: 'multiple_choice', question: 'Choose the correct sentence:', options: ['I have lived here since 2020.', 'I have lived here for 2020.', 'I live here since 2020.', 'I lived here since 2020.'], correctAnswer: 0, explanation: 'Since + نقطه شروع، for + مدت زمان', topic: 'grammar', grade: 9 },
      { id: 'q9_3', type: 'true_false', question: '"The number of students are increasing" is correct.', options: ['درست', 'غلط'], correctAnswer: 1, explanation: 'The number of + فعل مفرد (is)', topic: 'grammar', grade: 9 },
      { id: 'q9_4', type: 'multiple_choice', question: 'What is the passive voice of "She wrote a letter"?', options: ['A letter was written by her.', 'A letter is written by her.', 'A letter wrote by her.', 'A letter has written by her.'], correctAnswer: 0, explanation: 'Passive در گذشته ساده: was/were + past participle', topic: 'grammar', grade: 9 },
      { id: 'q9_5', type: 'short_answer', question: 'Write the superlative of "bad"', options: [], correctAnswer: 'worst', explanation: 'Bad عالی آن worst است', topic: 'grammar', grade: 9 },
      { id: 'q9_6', type: 'multiple_choice', question: 'Which word means "to make something better"?', options: ['worsen', 'improve', 'ignore', 'destroy'], correctAnswer: 1, explanation: 'Improve یعنی بهبود دادن', topic: 'vocabulary', grade: 9 },
      { id: 'q9_7', type: 'true_false', question: '"Despite" is followed by a noun or gerund.', options: ['درست', 'غلط'], correctAnswer: 0, explanation: 'Despite + noun/gerund (Despite the rain)', topic: 'grammar', grade: 9 },
      { id: 'q9_8', type: 'multiple_choice', question: 'What does "significant" mean?', options: ['بی‌اهمیت', 'قابل توجه', 'کوچک', 'سریع'], correctAnswer: 1, explanation: 'Significant یعنی قابل توجه/مهم', topic: 'vocabulary', grade: 9 },
    ]
  };

  // ---------- شروع آزمون ----------
  function init(params) {
    const user = LBAuth.getCurrentUser();
    if (!user) return;

    const grade = params[0] || user.grade;
    const week = params[1] || 1;
    const questionCount = parseInt(params[2]) || 5;
    const timeLimit = parseInt(params[3]) || 300;

    const allQuestions = QUESTION_BANK[grade] || [];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    currentQuiz = {
      id: LBStorage.generateId(),
      grade: parseInt(grade),
      week: parseInt(week),
      questions,
      timeLimit,
      startTime: Date.now(),
      answers: {}
    };

    answers = {};
    submitted = false;
    timeRemaining = timeLimit;

    renderQuizStart();
  }

  function renderQuizStart() {
    const container = document.getElementById('quiz-content');
    if (!container) return;

    container.innerHTML = `
      <div class="container" style="padding-top:100px">
        <div class="card">
          <h2>آزمون پایه ${currentQuiz.grade} — هفته ${currentQuiz.week}</h2>
          <p style="margin:1rem 0;color:var(--text-secondary)">
            تعداد سؤالات: ${currentQuiz.questions.length} | زمان: ${Math.floor(currentQuiz.timeLimit / 60)} دقیقه
          </p>
          <div style="background:var(--bg-secondary);padding:1rem;border-radius:var(--radius-sm);margin-bottom:1.5rem">
            <p style="font-weight:600;margin-bottom:0.5rem">📋 راهنما:</p>
            <ul style="color:var(--text-secondary);font-size:0.9rem;padding-right:1.5rem">
              <li>به هر سؤال با انتخاب گزینه یا تایپ پاسخ پاسخ دهید</li>
              <li>می‌توانید پاسخ‌های خود را قبل از ثبت نهایی تغییر دهید</li>
              <li>در پایان آزمون، پاسخ صحیح و توضیح هر سؤال نمایش داده می‌شود</li>
            </ul>
          </div>
          <button class="btn btn-primary btn-lg" onclick="LBQuiz.startQuiz()">شروع آزمون</button>
        </div>
      </div>
    `;
  }

  function startQuiz() {
    renderQuestion(0);
    startTimer();
  }

  // ---------- تایمر ----------
  function startTimer() {
    const timerEl = document.getElementById('quiz-timer');
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        submitQuiz();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('quiz-timer');
    if (!timerEl) return;

    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    timerEl.className = 'quiz-timer';
    if (timeRemaining <= 30) timerEl.classList.add('danger');
    else if (timeRemaining <= 60) timerEl.classList.add('warning');
  }

  // ---------- نمایش سؤال ----------
  function renderQuestion(index) {
    const container = document.getElementById('quiz-content');
    if (!container || !currentQuiz) return;

    const q = currentQuiz.questions[index];
    if (!q) return;

    const total = currentQuiz.questions.length;
    const progress = ((index + 1) / total) * 100;

    let optionsHtml = '';
    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const selected = currentQuiz.answers[q.id] === i ? 'selected' : '';
        optionsHtml += `
          <div class="quiz-option ${selected}" onclick="LBQuiz.selectAnswer('${q.id}', ${i})">
            <div class="quiz-option-letter">${letter}</div>
            <div>${LBStorage.sanitizeHTML(opt)}</div>
          </div>
        `;
      });
    } else if (q.type === 'short_answer') {
      const val = currentQuiz.answers[q.id] || '';
      optionsHtml = `
        <div class="form-group">
          <input type="text" id="answer-${q.id}" value="${LBStorage.sanitizeHTML(val)}"
                 placeholder="پاسخ خود را بنویسید..."
                 onchange="LBQuiz.setShortAnswer('${q.id}', this.value)">
        </div>
      `;
    }

    container.innerHTML = `
      <div class="container" style="padding-top:100px">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <span class="badge badge-primary">سؤال ${index + 1} از ${total}</span>
            <div class="quiz-timer" id="quiz-timer">05:00</div>
          </div>
          <div class="progress" style="margin-bottom:1.5rem">
            <div class="progress-bar" style="width:${progress}%"></div>
          </div>
          <h3 style="margin-bottom:1.5rem">${LBStorage.sanitizeHTML(q.question)}</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem">
            ${optionsHtml}
          </div>
          <div style="display:flex;justify-content:space-between">
            <button class="btn btn-outline" onclick="LBQuiz.prevQuestion(${index})" ${index === 0 ? 'disabled' : ''}>قبلی</button>
            ${index < total - 1
              ? `<button class="btn btn-primary" onclick="LBQuiz.nextQuestion(${index})">بعدی</button>`
              : `<button class="btn btn-success" onclick="LBQuiz.submitQuiz()">ثبت آزمون</button>`
            }
          </div>
        </div>
      </div>
    `;

    updateTimerDisplay();
  }

  function selectAnswer(questionId, optionIndex) {
    if (submitted) return;
    currentQuiz.answers[questionId] = optionIndex;
    // رفرش بصری
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
      opt.classList.toggle('selected', i === optionIndex);
    });
  }

  function setShortAnswer(questionId, value) {
    if (submitted) return;
    currentQuiz.answers[questionId] = value.trim().toLowerCase();
  }

  function nextQuestion(index) {
    renderQuestion(index + 1);
  }

  function prevQuestion(index) {
    if (index > 0) renderQuestion(index - 1);
  }

  // ---------- ثبت آزمون ----------
  function submitQuiz() {
    if (submitted) return;
    submitted = true;
    clearInterval(timerInterval);

    const user = LBAuth.getCurrentUser();
    if (!user || !currentQuiz) return;

    // محاسبه نمره
    let correct = 0;
    const review = [];

    currentQuiz.questions.forEach(q => {
      const userAnswer = currentQuiz.answers[q.id];
      let isCorrect = false;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === 'short_answer') {
        isCorrect = userAnswer && userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
      }

      if (isCorrect) correct++;

      review.push({
        question: q.question,
        userAnswer: q.type === 'short_answer' ? userAnswer : (q.options[userAnswer] || '—'),
        correctAnswer: q.type === 'short_answer' ? q.correctAnswer : q.options[q.correctAnswer],
        isCorrect,
        explanation: q.explanation
      });
    });

    const score = Math.round((correct / currentQuiz.questions.length) * 100);
    const timeTaken = Math.round((Date.now() - currentQuiz.startTime) / 1000);

    // ذخیره نتیجه
    const result = {
      id: currentQuiz.id,
      grade: currentQuiz.grade,
      week: currentQuiz.week,
      score,
      correct,
      total: currentQuiz.questions.length,
      timeTaken,
      date: new Date().toISOString(),
      review
    };

    LBStorage.saveQuizResult(user.id, result);

    // ثبت زمان مطالعه
    LBStorage.logStudyTime(user.id, Math.max(1, Math.round(timeTaken / 60)));

    renderResult(result);
  }

  // ---------- نمایش نتیجه ----------
  function renderResult(result) {
    const container = document.getElementById('quiz-content');
    if (!container) return;

    const grade = result.score >= 90 ? 'A' : result.score >= 80 ? 'B' : result.score >= 70 ? 'C' : result.score >= 60 ? 'D' : 'F';
    const gradeColor = result.score >= 80 ? 'var(--success)' : result.score >= 60 ? 'var(--warning)' : 'var(--danger)';

    const reviewHtml = result.review.map((r, i) => `
      <div class="card" style="margin-bottom:1rem;border-right:4px solid ${r.isCorrect ? 'var(--success)' : 'var(--danger)'}">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <h4>${i + 1}. ${LBStorage.sanitizeHTML(r.question)}</h4>
          <span class="badge ${r.isCorrect ? 'badge-success' : 'badge-danger'}">${r.isCorrect ? '✓ درست' : '✗ غلط'}</span>
        </div>
        <p style="margin-top:0.5rem"><strong>پاسخ شما:</strong> ${LBStorage.sanitizeHTML(r.userAnswer)}</p>
        ${!r.isCorrect ? `<p><strong>پاسخ صحیح:</strong> ${LBStorage.sanitizeHTML(r.correctAnswer)}</p>` : ''}
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-top:0.5rem">💡 ${LBStorage.sanitizeHTML(r.explanation)}</p>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="container" style="padding-top:100px">
        <div class="card" style="text-align:center;margin-bottom:2rem">
          <h2>نتیجه آزمون</h2>
          <div style="font-size:4rem;font-weight:800;color:${gradeColor};margin:1rem 0">${result.score}%</div>
          <div style="font-size:2rem;font-weight:700;color:${gradeColor}">درجه ${grade}</div>
          <p style="color:var(--text-secondary);margin-top:0.5rem">
            ${result.correct} از ${result.total} سؤال صحیح | زمان: ${Math.floor(result.timeTaken / 60)} دقیقه ${result.timeTaken % 60} ثانیه
          </p>
          <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem">
            <button class="btn btn-primary" onclick="LBApp.navigate('quiz')">آزمون جدید</button>
            <button class="btn btn-outline" onclick="LBApp.navigate('dashboard')">داشبورد</button>
          </div>
        </div>
        <h3 style="margin-bottom:1rem">مرور پاسخ‌ها</h3>
        ${reviewHtml}
      </div>
    `;
  }

  // ---------- تاریخچه ----------
  function renderHistory() {
    const user = LBAuth.getCurrentUser();
    if (!user) return '';

    const results = LBStorage.getQuizResults(user.id);
    if (results.length === 0) {
      return '<div class="empty-state"><div class="empty-state-icon">📝</div><p>هنوز آزمونی انجام نداده‌اید</p></div>';
    }

    return `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>پایه</th>
              <th>هفته</th>
              <th>نمره</th>
              <th>زمان</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => `
              <tr>
                <td>${new Date(r.date).toLocaleDateString('fa-IR')}</td>
                <td>${r.grade}</td>
                <td>${r.week}</td>
                <td><span class="badge ${r.score >= 80 ? 'badge-success' : r.score >= 60 ? 'badge-warning' : 'badge-danger'}">${r.score}%</span></td>
                <td>${Math.floor(r.timeTaken / 60)}:${(r.timeTaken % 60).toString().padStart(2, '0')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return { init, startQuiz, selectAnswer, setShortAnswer, nextQuestion, prevQuestion, submitQuiz, renderHistory };
})();
