# Direct Hosting Installation Guide (বাংলা + English)

এই প্রজেক্টটি নতুন হোস্টিংয়ে (cPanel Node.js, aaPanel, CyberPanel, VPS, Render, Railway বা Docker) আপলোড করে সরাসরি ইনস্টল করার জন্য নিচের যেকোনো একটি পদ্ধতি অনুসরণ করুন।

---

## Method 1: cPanel Shared Hosting (Setup Node.js App)

1. প্রজেক্টের ফাইলগুলো ZIP করে cPanel File Manager-এ আপনার ফোল্ডারে Upload ও Extract করুন (`node_modules` বাদে)।
2. cPanel-এ **Setup Node.js App** ওপেন করে **Create Application** ক্লিক করুন:
   - **Node.js version**: `18` বা `20` বা `22`
   - **Application mode**: `Production`
   - **Application root**: আপনার ফোল্ডারের নাম
   - **Application startup file**: `app.cjs`
3. **Environment variables** এ নিচের ভ্যারিয়েবলগুলো যোগ করুন:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = যেকোনো 32+ ক্যারেক্টারের র‍্যান্ডম কী
   - `FORCE_INSTALL_REDIRECT` = `true` (প্রথমবার `/install` অটো-ওপেন করার জন্য)
4. **Run NPM Install** বাটনে একবার ক্লিক করুন।
5. প্রজেক্টের ভেতরে আগে থেকেই তৈরি করা **`prebuilt/`** ফোল্ডার আছে, তাই cPanel-এ আর **`Run JS script -> build` চালানোর দরকার নেই** (`app.cjs` অটোমেটিক `prebuilt/` থেকে সাইট চালাবে)।
6. অ্যাপের Document Root আর Application Root একই ফোল্ডার হলে `.htaccess`-এর নিচে `DirectoryIndex disabled` যোগ করুন।
7. অ্যাপটি **Start / Restart** করুন।
8. ব্রাউজারে `https://yourdomain.com/install` ওপেন করে ৩ ধাপে আপনার Site Name ও Admin Account সেট করে নিন। ইনস্টল শেষ হলে `/install` অটোমেটিক লক হয়ে যাবে।

---

## Method 2: VPS / Ubuntu / aaPanel / CyberPanel (1-Command Installer)

ফাইল আপলোড করার পর আপনার সার্ভারের টার্মিনালে ফোল্ডারটির ভেতর থেকে শুধু এই কমান্ডটি চালান:

```bash
bash install.sh
```

এটি অটোমেটিক:
- Node.js ভার্সন চেক করবে
- সুরক্ষিত র‍্যান্ডম `SESSION_SECRET` সহ `.env` ফাইল তৈরি করবে
- `data/` ফোল্ডার প্রস্তুত করবে
- ডিপেন্ডেন্সি ইনস্টল ও প্রোডাকশন বিল্ড করবে
- PM2 থাকলে সার্ভার চালু করে দেবে

এরপর ব্রাউজারে `http://YOUR-DOMAIN:3000/install` ওপেন করে ওয়েব ইনস্টলার সম্পূর্ণ করুন।

---

## Method 3: Docker / Render / Railway / Coolify

সরাসরি রিপোজিটরি বা ফোল্ডার ডিপ্লয় করুন — `Dockerfile` অটোমেটিক ডিটেক্ট হয়ে বিল্ড ও রান হবে। ডেটা স্থায়ী রাখতে `/app/data` ফোল্ডারে একটি Persistent Volume মাউন্ট করুন এবং Environment Variables-এ `SESSION_SECRET` সেট করুন। তারপর `https://yourdomain.com/install` ওপেন করুন।

---

## Security Lock Note
ইনস্টলেশন শেষ হলে `data/.installed.lock` ফাইল তৈরি হয় এবং `/install` পার্মানেন্টলি লক হয়ে যায়। কখনো আবার নতুন করে ইনস্টল করতে চাইলে হোস্টিং File Manager থেকে `data/.installed.lock` ডিলিট করে `/install` পেজ রিফ্রেশ করুন।
