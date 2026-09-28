# 🌉 LangBridge - سامانه آموزش زبان انگلیسی

سامانه جامع آموزش زبان انگلیسی برای دانش‌آموزان پایه‌های هفتم، هشتم و نهم.

## ویژگی‌ها

- ✅ ثبت‌نام و ورود با ایمیل و رمز عبور
- ✅ آزمون هفتگی زمان‌دار با سؤالات چندگزینه‌ای، درست و غلط و پاسخ کوتاه
- ✅ فلش‌کارت هوشمند با سیستم مرور فاصله‌دار
- ✅ رتبه‌بندی هفتگی و کلی
- ✅ داشبورد پیشرفت با نمودار و آمار
- ✅ پشتیبان‌گیری و بازیابی اطلاعات
- ✅ حالت روشن و تاریک
- ✅ طراحی واکنش‌گرا برای موبایل و دسکتاپ
- ✅ پنل مدیریت (برای ادمین)

## راه‌اندازی روی GitHub Pages

### ۱. ساخت مخزن GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/langbridge.git
git push -u origin main
```

### ۲. فعال‌سازی GitHub Pages

1. به مخزن خود در GitHub بروید
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main / root
5. Save

### ۳. دسترسی به سایت

سایت شما به آدرس زیر در دسترس خواهد بود:
```
https://YOUR_USERNAME.github.io/langbridge/
```

## اتصال به Supabase (اختیاری)

برای ذخیره‌سازی آنلاین و همگام‌سازی بین دستگاه‌ها:

1. یک پروژه جدید در [supabase.com](https://supabase.com) بسازید
2. اسکیمای `sql/schema.sql` را در SQL Editor اجرا کنید
3. مقادیر زیر را در فایل `.env` قرار دهید:

```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

4. در `js/storage.js` بخش Supabase را فعال کنید

## ساختار پروژه

```
LangBridge/
├── index.html          # صفحه اصلی
├── css/
│   └── style.css       # استایل‌ها
├── js/
│   ├── storage.js      # مدیریت ذخیره‌سازی
│   ├── app.js          # هسته اصلی
│   ├── auth.js         # احراز هویت
│   ├── quiz.js         # سیستم آزمون
│   ├── flashcards.js   # فلش‌کارت
│   ├── dashboard.js    # داشبورد
│   ├── admin.js        # پنل مدیریت
│   └── leaderboard.js  # رتبه‌بندی
├── sql/
│   └── schema.sql      # اسکیمای پایگاه داده
├── .env.example        # نمونه متغیرهای محیطی
└── README_FA.md        # این فایل
```

## نکات امنیتی

- رمز عبورها با SHA-256 هش می‌شوند
- داده‌های کاربران در localStorage مرورگر ذخیره می‌شوند
- برای استفاده واقعی، اتصال به Supabase توصیه می‌شود
- هیچ کلید محرمانه‌ای در کد عمومی قرار نمی‌گیرد

## محدودیت‌ها

- بدون اتصال به Supabase، داده‌ها فقط در مرورگر محلی ذخیره می‌شوند
- بازیابی رمز عبور واقعی (ارسال ایمیل) نیاز به سرویس خارجی دارد
- محتوای آموزشی فعلی نمونه است و باید با محتوای رسمی کتاب جایگزین شود

## لایسنس

MIT
