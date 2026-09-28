/* ============================================
   LangBridge - سیستم فلش‌کارت
   ============================================ */
window.LBFlashcards = (function() {
  let currentDeck = null;
  let currentCardIndex = 0;
  let isFlipped = false;
  let studyCards = [];

  // ---------- واژگان نمونه ----------
  const SAMPLE_VOCAB = {
    7: [
      { word: 'apple', meaning: 'سیب', example: 'I eat an apple every day.', exampleTranslation: 'من هر روز یک سیب می‌خورم.', topic: 'food' },
      { word: 'book', meaning: 'کتاب', example: 'This book is interesting.', exampleTranslation: 'این کتاب جالب است.', topic: 'school' },
      { word: 'cat', meaning: 'گربه', example: 'The cat is sleeping.', exampleTranslation: 'گربه در حال خوابیدن است.', topic: 'animals' },
      { word: 'dog', meaning: 'سگ', example: 'My dog is very friendly.', exampleTranslation: 'سگ من خیلی دوستانه است.', topic: 'animals' },
      { word: 'house', meaning: 'خانه', example: 'Their house is big.', exampleTranslation: 'خانه آن‌ها بزرگ است.', topic: 'home' },
      { word: 'water', meaning: 'آب', example: 'Drink more water.', exampleTranslation: 'بیشتر آب بنوش.', topic: 'food' },
      { word: 'school', meaning: 'مدرسه', example: 'I go to school by bus.', exampleTranslation: 'من با اتوبوس به مدرسه می‌روم.', topic: 'school' },
      { word: 'friend', meaning: 'دوست', example: 'She is my best friend.', exampleTranslation: 'او بهترین دوست من است.', topic: 'people' },
      { word: 'family', meaning: 'خانواده', example: 'I love my family.', exampleTranslation: 'من خانواده‌ام را دوست دارم.', topic: 'people' },
      { word: 'happy', meaning: 'خوشحال', example: 'I am happy today.', exampleTranslation: 'من امروز خوشحالم.', topic: 'feelings' },
    ],
    8: [
      { word: 'improve', meaning: 'بهبود دادن', example: 'I want to improve my English.', exampleTranslation: 'می‌خواهم انگلیسی‌ام را بهبود دهم.', topic: 'verbs' },
      { word: 'journey', meaning: 'سفر', example: 'The journey was long.', exampleTranslation: 'سفر طولانی بود.', topic: 'travel' },
      { word: 'knowledge', meaning: 'دانش', example: 'Reading gives us knowledge.', exampleTranslation: 'خواندن به ما دانش می‌دهد.', topic: 'abstract' },
      { word: 'library', meaning: 'کتابخانه', example: 'I study in the library.', exampleTranslation: 'من در کتابخانه درس می‌خوانم.', topic: 'school' },
      { word: 'mountain', meaning: 'کوه', example: 'The mountain is covered with snow.', exampleTranslation: 'کوه پوشیده از برف است.', topic: 'nature' },
      { word: 'neighbor', meaning: 'همسایه', example: 'My neighbor is very kind.', exampleTranslation: 'همسایه من خیلی مهربان است.', topic: 'people' },
      { word: 'ocean', meaning: 'اقیانوس', example: 'The ocean is vast.', exampleTranslation: 'اقیانوس وسیع است.', topic: 'nature' },
      { word: 'practice', meaning: 'تمرین', example: 'Practice makes perfect.', exampleTranslation: 'تمرین کمال می‌آورد.', topic: 'abstract' },
      { word: 'question', meaning: 'سؤال', example: 'Do you have a question?', exampleTranslation: 'آیا سؤالی دارید؟', topic: 'school' },
      { word: 'remember', meaning: 'به یاد داشتن', example: 'I remember this word.', exampleTranslation: 'من این کلمه را به یاد دارم.', topic: 'verbs' },
    ],
    9: [
      { word: 'achieve', meaning: 'دست یافتن', example: 'She achieved her goal.', exampleTranslation: 'او به هدفش رسید.', topic: 'verbs' },
      { word: 'benefit', meaning: 'سود/فایده', example: 'Exercise has many benefits.', exampleTranslation: 'ورزش فواید زیادی دارد.', topic: 'abstract' },
      { word: 'challenge', meaning: 'چالش', example: 'Learning a language is a challenge.', exampleTranslation: 'یادگیری یک زبان یک چالش است.', topic: 'abstract' },
      { word: 'determine', meaning: 'تعیین کردن', example: 'We must determine the cause.', exampleTranslation: 'باید علت را تعیین کنیم.', topic: 'verbs' },
      { word: 'environment', meaning: 'محیط زیست', example: 'We must protect the environment.', exampleTranslation: 'باید از محیط زیست محافظت کنیم.', topic: 'nature' },
      { word: 'frequent', meaning: 'مکرر/پیوسته', example: 'He is a frequent visitor.', exampleTranslation: 'او یک بازدیدکننده مکرر است.', topic: 'adjectives' },
      { word: 'government', meaning: 'دولت', example: 'The government announced new rules.', exampleTranslation: 'دولت قوانین جدیدی اعلام کرد.', topic: 'society' },
      { word: 'however', meaning: 'با این حال', example: 'It was hard; however, I succeeded.', exampleTranslation: 'سخت بود؛ با این حال موفق شدم.', topic: 'connectors' },
      { word: 'influence', meaning: 'تأثیر', example: 'Parents have great influence on children.', exampleTranslation: 'والدین تأثیر زیادی روی کودکان دارند.', topic: 'abstract' },
      { word: 'justice', meaning: 'عدالت', example: 'Justice must be served.', exampleTranslation: 'عدالت باید اجرا شود.', topic: 'society' },
    ]
  };

  // ---------- شروع ----------
  function init() {
    const user = LBAuth.getCurrentUser();
    if (!user) return;

    // اگر فلش‌کارتی ندارد، واژگان نمونه بساز
    let cards = LBStorage.getFlashcards(user.id);
    if (cards.length === 0) {
      cards = createSampleCards(user.grade);
      LBStorage.saveFlashcards(user.id, cards);
    }

    renderFlashcards();
  }

  function createSampleCards(grade) {
    const vocab = SAMPLE_VOCAB[grade] || [];
    return vocab.map((v, i) => ({
      id: 'card_' + i,
      word: v.word,
      meaning: v.meaning,
      example: v.example,
      exampleTranslation: v.exampleTranslation,
      grade,
      topic: v.topic,
      difficulty: Math.min(3, Math.floor(i / 4) + 1),
      learned: false,
      reviewDate: null,
      createdAt: new Date().toISOString()
    }));
  }

  // ---------- رندر ----------
  function renderFlashcards() {
    const container = document.getElementById('flashcards-content');
    if (!container) return;

    const user = LBAuth.getCurrentUser();
    const cards = LBStorage.getFlashcards(user.id);
    const learned = cards.filter(c => c.learned).length;

    container.innerHTML = `
      <div class="container" style="padding-top:100px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
          <h2>فلش‌کارت‌ها</h2>
          <div style="display:flex;gap:0.5rem">
            <button class="btn btn-primary btn-sm" onclick="LBFlashcards.startStudy()">شروع مطالعه</button>
            <button class="btn btn-outline btn-sm" onclick="LBFlashcards.startQuiz()">آزمون واژگان</button>
            <button class="btn btn-outline btn-sm" onclick="LBFlashcards.addCard()">افزودن واژه</button>
          </div>
        </div>
        <div class="stats-grid" style="margin-bottom:2rem">
          <div class="stat-card">
            <div class="stat-value">${cards.length}</div>
            <div class="stat-label">کل واژگان</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${learned}</div>
            <div class="stat-label">یادگرفته‌شده</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${cards.length - learned}</div>
            <div class="stat-label">باقی‌مانده</div>
          </div>
        </div>
        <div id="flashcard-study-area"></div>
        <div class="card">
          <h3 style="margin-bottom:1rem">فهرست واژگان</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>واژه</th>
                  <th>معنی</th>
                  <th>موضوع</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                ${cards.map(c => `
                  <tr>
                    <td><strong>${c.word}</strong></td>
                    <td>${c.meaning}</td>
                    <td><span class="badge badge-secondary">${c.topic}</span></td>
                    <td>${c.learned ? '<span class="badge badge-success">یادگرفته</span>' : '<span class="badge badge-warning">در حال یادگیری</span>'}</td>
                    <td>
                      <button class="btn btn-sm btn-outline" onclick="LBFlashcards.toggleLearned('${c.id}')">${c.learned ? 'لغو' : 'یادگرفته'}</button>
                      <button class="btn btn-sm btn-danger" onclick="LBFlashcards.deleteCard('${c.id}')">حذف</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- مطالعه ----------
  function startStudy() {
    const user = LBAuth.getCurrentUser();
    const cards = LBStorage.getFlashcards(user.id).filter(c => !c.learned);

    if (cards.length === 0) {
      LBApp.showToast('همه واژگان را یاد گرفته‌اید! 🎉', 'success');
      return;
    }

    studyCards = [...cards].sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    isFlipped = false;
    renderStudyCard();
  }

  function renderStudyCard() {
    const area = document.getElementById('flashcard-study-area');
    if (!area || studyCards.length === 0) return;

    const card = studyCards[currentCardIndex];
    const total = studyCards.length;

    area.innerHTML = `
      <div class="card" style="margin-bottom:2rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:1rem">
          <span class="badge badge-primary">${currentCardIndex + 1} از ${total}</span>
          <button class="btn btn-sm btn-outline" onclick="LBFlashcards.endStudy()">پایان مطالعه</button>
        </div>
        <div class="flashcard ${isFlipped ? 'flipped' : ''}" onclick="LBFlashcards.flipCard()">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-word">${card.word}</div>
              <div class="flashcard-example">${card.example}</div>
              <p style="margin-top:1rem;font-size:0.875rem;opacity:0.7">برای دیدن معنی کلیک کنید</p>
            </div>
            <div class="flashcard-back">
              <div class="flashcard-meaning">${card.meaning}</div>
              <div class="flashcard-example" style="color:var(--text-secondary)">${card.exampleTranslation}</div>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem">
          <button class="btn btn-danger" onclick="LBFlashcards.markCard(false)">نمی‌دانم</button>
          <button class="btn btn-success" onclick="LBFlashcards.markCard(true)">می‌دانم</button>
        </div>
      </div>
    `;
  }

  function flipCard() {
    isFlipped = !isFlipped;
    renderStudyCard();
  }

  function markCard(known) {
    const user = LBAuth.getCurrentUser();
    const cards = LBStorage.getFlashcards(user.id);
    const card = studyCards[currentCardIndex];

    if (known) {
      const idx = cards.findIndex(c => c.id === card.id);
      if (idx !== -1) {
        cards[idx].learned = true;
        cards[idx].reviewDate = new Date().toISOString();
        LBStorage.saveFlashcards(user.id, cards);
      }
    }

    currentCardIndex++;
    isFlipped = false;

    if (currentCardIndex >= studyCards.length) {
      LBApp.showToast('مطالعه تمام شد! آفرین! 🎉', 'success');
      renderFlashcards();
    } else {
      renderStudyCard();
    }
  }

  function endStudy() {
    renderFlashcards();
  }

  // ---------- آزمون واژگان ----------
  function startQuiz() {
    const user = LBAuth.getCurrentUser();
    const cards = LBStorage.getFlashcards(user.id);

    if (cards.length < 4) {
      LBApp.showToast('برای آزمون حداقل ۴ واژه لازم است', 'warning');
      return;
    }

    const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, Math.min(10, cards.length));
    let currentQ = 0;
    let score = 0;

    function renderQ() {
      const area = document.getElementById('flashcard-study-area');
      if (!area) return;

      const card = shuffled[currentQ];
      const otherWords = cards.filter(c => c.id !== card.id).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...otherWords.map(c => c.meaning), card.meaning].sort(() => Math.random() - 0.5);

      area.innerHTML = `
        <div class="card" style="margin-bottom:2rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:1rem">
            <span class="badge badge-primary">سؤال ${currentQ + 1} از ${shuffled.length}</span>
            <span class="badge badge-success">امتیاز: ${score}</span>
          </div>
          <h3 style="margin-bottom:1.5rem">معنی کلمه "${card.word}" چیست؟</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem">
            ${options.map(opt => `
              <div class="quiz-option" onclick="LBFlashcards.answerQuiz(this, '${opt}', '${card.meaning}')">
                <div class="quiz-option-letter">●</div>
                <div>${opt}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    window.LBFlashcards.answerQuiz = function(el, selected, correct) {
      const isCorrect = selected === correct;
      if (isCorrect) score++;

      el.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) {
        document.querySelectorAll('.quiz-option').forEach(o => {
          if (o.textContent.includes(correct)) o.classList.add('correct');
        });
      }

      setTimeout(() => {
        currentQ++;
        if (currentQ >= shuffled.length) {
          const area = document.getElementById('flashcard-study-area');
          if (area) {
            area.innerHTML = `
              <div class="card" style="text-align:center">
                <h3>نتیجه آزمون واژگان</h3>
                <div style="font-size:3rem;font-weight:800;color:var(--primary);margin:1rem 0">${score} از ${shuffled.length}</div>
                <p style="color:var(--text-secondary)">${Math.round((score / shuffled.length) * 100)}٪ درست</p>
                <button class="btn btn-primary" onclick="LBFlashcards.renderFlashcards()">بازگشت</button>
              </div>
            `;
          }
        } else {
          renderQ();
        }
      }, 1500);
    };

    renderQ();
  }

  // ---------- افزودن واژه ----------
  function addCard() {
    const user = LBAuth.getCurrentUser();
    LBApp.openModal('افزودن واژه جدید', `
      <form onsubmit="return LBFlashcards.saveNewCard(event)">
        <div class="form-group">
          <label>واژه انگلیسی</label>
          <input type="text" id="new-word" required placeholder="example">
        </div>
        <div class="form-group">
          <label>معنی فارسی</label>
          <input type="text" id="new-meaning" required placeholder="مثال">
        </div>
        <div class="form-group">
          <label>جمله مثال (انگلیسی)</label>
          <input type="text" id="new-example" placeholder="This is an example.">
        </div>
        <div class="form-group">
          <label>ترجمه جمله</label>
          <input type="text" id="new-example-fa" placeholder="این یک مثال است.">
        </div>
        <div class="form-group">
          <label>موضوع</label>
          <select id="new-topic">
            <option value="vocabulary">واژگان عمومی</option>
            <option value="food">غذا</option>
            <option value="school">مدرسه</option>
            <option value="nature">طبیعت</option>
            <option value="people">افراد</option>
            <option value="verbs">افعال</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%">ذخیره واژه</button>
      </form>
    `);
  }

  function saveNewCard(event) {
    event.preventDefault();
    const user = LBAuth.getCurrentUser();
    const cards = LBStorage.getFlashcards(user.id);

    const newCard = {
      id: 'card_' + Date.now(),
      word: document.getElementById('new-word').value.trim(),
      meaning: document.getElementById('new-meaning').value.trim(),
      example: document.getElementById('new-example').value.trim(),
      exampleTranslation: document.getElementById('new-example-fa').value.trim(),
      grade: user.grade,
      topic: document.getElementById('new-topic').value,
      difficulty: 1,
      learned: false,
      reviewDate: null,
      createdAt: new Date().toISOString()
    };

    cards.push(newCard);
    LBStorage.saveFlashcards(user.id, cards);
    LBApp.closeModal();
    LBApp.showToast('واژه جدید اضافه شد', 'success');
    renderFlashcards();
    return false;
  }

  function toggleLearned(cardId) {
    const user = LBAuth.getCurrentUser();
    const cards = LBStorage.getFlashcards(user.id);
    const idx = cards.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      cards[idx].learned = !cards[idx].learned;
      LBStorage.saveFlashcards(user.id, cards);
      renderFlashcards();
    }
  }

  function deleteCard(cardId) {
    if (!confirm('آیا از حذف این واژه مطمئن هستید؟')) return;
    const user = LBAuth.getCurrentUser();
    const cards = LBStorage.getFlashcards(user.id).filter(c => c.id !== cardId);
    LBStorage.saveFlashcards(user.id, cards);
    LBApp.showToast('واژه حذف شد', 'info');
    renderFlashcards();
  }

  return { init, startStudy, flipCard, markCard, endStudy, startQuiz, addCard, saveNewCard, toggleLearned, deleteCard, renderFlashcards };
})();
