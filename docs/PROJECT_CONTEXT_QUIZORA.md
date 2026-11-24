# PROJECT CONTEXT — QUIZORA

> Dokumen konteks utama untuk AI Agent yang mengembangkan proyek Tugas Akhir Praktikum Pemrograman Perangkat Bergerak.

## 1. Identitas Proyek

- **Nama aplikasi:** Quizora
- **Tagline:** Daily Knowledge Quiz
- **Judul proyek:** Aplikasi Progressive Web App untuk Kuis Pengetahuan Harian Berbasis RESTful API
- **Jenis tugas:** Tugas Akhir Praktikum Pemrograman Perangkat Bergerak
- **Sifat tugas:** Individu
- **Platform yang dipilih:** Progressive Web App (PWA)

## 2. Latar Belakang dan Tujuan

Quizora adalah aplikasi kuis pengetahuan harian yang memungkinkan pengguna menjelajahi kategori kuis, mengerjakan pertanyaan pilihan ganda, memperoleh nilai, membaca pembahasan, dan melihat riwayat pengerjaan.

Aplikasi ditujukan untuk pelajar, mahasiswa, dan masyarakat umum. Pengalaman penggunaan dirancang dengan pendekatan mobile-first agar nyaman digunakan melalui smartphone, tetapi tetap responsif pada layar desktop.

Tujuan pengembangan:
1. Menerapkan konsep Progressive Web App.
2. Membangun frontend menggunakan React dan Vite.
3. Membuat RESTful API sendiri menggunakan Node.js dan Express.js.
4. Menghubungkan backend dengan database Supabase PostgreSQL.
5. Mengintegrasikan frontend dengan API menggunakan Axios.
6. Menerapkan navigasi, state management, error handling, dan penyimpanan lokal yang diperlukan.
7. Menerapkan registrasi dan login supaya fitur aplikasi hanya bisa diakses pengguna terautentikasi.
8. Mengunggah source code ke GitHub dan menyiapkan deployment.

## 3. Ketentuan Wajib Tugas Akhir

Aplikasi harus memenuhi seluruh ketentuan berikut:

| No. | Ketentuan | Implementasi pada Quizora |
|---|---|---|
| 1 | Menggunakan API (Web Service) yang dibuat sendiri sesuai Modul 1 | Backend Express.js menyediakan RESTful API dan mengakses Supabase |
| 2 | Memiliki Bottom Navigation Bar | Navigasi utama: Home, Categories, History, Profile, About |
| 3 | Memiliki minimal 5 halaman | Quizora dirancang memiliki 8 halaman utama |
| 4 | Minimal 2 halaman utama memiliki list dan setiap item dapat diklik untuk membuka halaman detail | Categories → Category Detail; Quiz History → Quiz Result |
| 5 | Memiliki halaman Profile dan About | Profil pengguna dan statistik; halaman About menjelaskan aplikasi dan teknologinya |
| 6 | Source code Tugas Akhir diunggah ke GitHub | Repository GitHub berisi source code proyek |
| 7 | Judul tidak boleh sama dengan praktikan lain yang menggunakan materi/platform sama | Gunakan nama dan judul Quizora; tetap pastikan keunikan judul kepada dosen/kelas |

## 4. Teknologi yang Digunakan

### Frontend
- React JS
- Vite
- JavaScript
- React Router DOM untuk navigasi halaman
- Axios untuk komunikasi HTTP
- CSS untuk styling responsif
- Lucide React untuk ikon
- vite-plugin-pwa untuk konfigurasi PWA, jika pendekatan ini disetujui dan konsisten dengan modul

### Backend
- Node.js
- Express.js
- JavaScript ES Modules
- Supabase JavaScript Client (`@supabase/supabase-js`)
- Supabase Auth untuk registrasi, login, dan sesi pengguna
- dotenv untuk environment variables
- CORS
- Arsitektur terpisah dengan pola Model, Controller, dan Routes

### Database dan deployment
- Supabase PostgreSQL sebagai database
- Git dan GitHub untuk version control dan repository
- Vercel sebagai target deployment frontend/backend, setelah kompatibilitas konfigurasi backend diverifikasi

## 5. Batas Arsitektur Aplikasi

Alur komunikasi yang wajib diterapkan:

```text
Pengguna
   |
   v
React PWA (Frontend)
   |
   | HTTP request melalui Axios
   v
Express RESTful API (Backend buatan sendiri)
   |
   | Supabase client
   v
Supabase PostgreSQL
```

Ketentuan arsitektur:
1. Frontend harus berkomunikasi dengan backend Express milik proyek.
2. Backend Express menjadi perantara akses database Supabase.
3. Frontend tidak boleh mengakses tabel Supabase secara langsung untuk menggantikan API buatan sendiri.
4. Jangan menaruh Supabase service-role key atau kredensial rahasia di frontend.
5. Jangan menyimpan file `.env` ke GitHub.
6. Gunakan `.env.example` tanpa nilai rahasia sebagai panduan konfigurasi.
7. Jangan menggunakan data mock/statis sebagai pengganti integrasi API pada hasil akhir. Data seed boleh digunakan untuk mengisi database selama pengujian.

## 6. Rancangan Halaman dan Navigasi

Quizora direncanakan memiliki halaman berikut:

| No. | Halaman | Isi dan fungsi |
|---|---|---|
| 1 | Home | Ringkasan aktivitas, Daily Quiz, kategori pilihan, dan rekomendasi kuis |
| 2 | Categories | Daftar seluruh kategori kuis |
| 3 | Category Detail | Daftar kuis pada kategori yang dipilih |
| 4 | Quiz Detail | Deskripsi, tingkat kesulitan, jumlah soal, durasi, dan tombol mulai |
| 5 | Quiz Session | Pertanyaan, pilihan jawaban, indikator progres, dan timer |
| 6 | Quiz Result | Nilai, jumlah jawaban benar/salah, serta pembahasan |
| 7 | Quiz History | Daftar percobaan kuis sebelumnya |
| 8 | Profile | Edit foto dan nama pengguna, statistik ringkas, dan riwayat belajar |
| 9 | About | Penjelasan aplikasi Quizora dan teknologi yang digunakan |

Bottom Navigation Bar:
- Home
- Categories
- History
- Profile
- About

Halaman Quiz Session dan Quiz Result dapat dibuka melalui alur kuis dan tidak harus menjadi item Bottom Navigation.

Dua alur list-detail yang harus berfungsi:
- Categories → pilih kategori → Category Detail.
- Quiz History → pilih riwayat → Quiz Result/detail hasil.

## 7. Fitur Fungsional

### Fitur inti
1. Menampilkan kuis harian.
2. Menampilkan daftar kategori.
3. Menampilkan kuis berdasarkan kategori.
4. Menampilkan detail kuis sebelum dimulai.
5. Memulai pengerjaan kuis.
6. Menampilkan pertanyaan pilihan ganda.
7. Menyediakan timer sesuai durasi kuis.
8. Menyimpan pilihan jawaban selama sesi berjalan.
9. Mengirim jawaban ke backend ketika kuis diselesaikan.
10. Menghitung skor di backend.
11. Menampilkan hasil dan pembahasan setelah submit.
12. Menyimpan riwayat pengerjaan.
13. Menampilkan riwayat pengerjaan pengguna.

### Fitur pendukung
- Indikator progres soal.
- Tampilan loading, error, dan empty state.
- Tombol mencoba kembali jika request gagal.
- Registrasi dan login menggunakan username dan password melalui API backend tanpa email asli; backend yang menangani Supabase Auth.
- Foto profil disimpan di Supabase Storage dan nama pengguna pada metadata akun.
- Statistik sederhana seperti jumlah kuis yang diselesaikan dan skor terakhir/rata-rata jika datanya tersedia.

### Batasan versi awal
- Leaderboard, multiplayer, chat, dan panel admin penuh bukan prioritas.
- Jangan menambah fitur kompleks sebelum semua persyaratan wajib selesai dan teruji.

## 8. Rancangan Database Awal

Gunakan Supabase PostgreSQL. Skema berikut merupakan rancangan awal yang harus ditinjau dan disepakati sebelum membuat migration.

### 8.1 `categories`
| Kolom | Tipe yang disarankan | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| name | TEXT | Nama kategori |
| slug | TEXT | Identitas URL, sebaiknya unik |
| description | TEXT | Deskripsi kategori |
| icon_name | TEXT | Nama ikon yang dikenali frontend |
| created_at | TIMESTAMPTZ | Waktu pembuatan |

### 8.2 `quizzes`
| Kolom | Tipe yang disarankan | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| category_id | UUID | Foreign key ke categories |
| title | TEXT | Judul kuis |
| description | TEXT | Deskripsi kuis |
| difficulty | TEXT | Tingkat kesulitan, misalnya easy/medium/hard |
| duration_seconds | INTEGER | Durasi pengerjaan dalam detik |
| is_daily | BOOLEAN | Penanda kuis harian |
| daily_date | DATE | Tanggal kuis harian, bila berlaku |
| is_published | BOOLEAN | Status publikasi |
| created_at | TIMESTAMPTZ | Waktu pembuatan |

### 8.3 `questions`
| Kolom | Tipe yang disarankan | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| quiz_id | UUID | Foreign key ke quizzes |
| question_text | TEXT | Isi pertanyaan |
| explanation | TEXT | Pembahasan jawaban |
| points | INTEGER | Bobot nilai soal |
| order_number | INTEGER | Urutan soal |

### 8.4 `answer_options`
| Kolom | Tipe yang disarankan | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| question_id | UUID | Foreign key ke questions |
| option_label | TEXT | Label A/B/C/D |
| option_text | TEXT | Isi pilihan |
| is_correct | BOOLEAN | Kunci jawaban, hanya untuk proses backend |

### 8.5 `quiz_attempts`
| Kolom | Tipe yang disarankan | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| guest_id | UUID | Verified Supabase Auth user ID (legacy column name) |
| quiz_id | UUID | Foreign key ke quizzes |
| started_at | TIMESTAMPTZ | Waktu mulai |
| submitted_at | TIMESTAMPTZ | Waktu submit |
| score | NUMERIC | Nilai akhir |
| correct_count | INTEGER | Jumlah jawaban benar |
| total_questions | INTEGER | Jumlah soal |
| duration_seconds | INTEGER | Lama pengerjaan aktual |

### 8.6 `quiz_attempt_answers`
| Kolom | Tipe yang disarankan | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| attempt_id | UUID | Foreign key ke quiz_attempts |
| question_id | UUID | Foreign key ke questions |
| selected_option_id | UUID | Foreign key ke answer_options; dapat null jika tidak dijawab |
| is_correct | BOOLEAN | Hasil validasi backend |

### Relasi utama
```text
categories 1 ---- N quizzes
quizzes 1 ---- N questions
questions 1 ---- N answer_options
quizzes 1 ---- N quiz_attempts
quiz_attempts 1 ---- N quiz_attempt_answers
questions 1 ---- N quiz_attempt_answers
answer_options 1 ---- N quiz_attempt_answers
```

### Aturan integritas database
- Gunakan foreign key dan aturan penghapusan yang sesuai.
- Pastikan satu soal memiliki pilihan jawaban yang valid.
- Tentukan aturan agar satu soal tidak memiliki lebih dari satu jawaban benar untuk model pilihan tunggal.
- Cegah pengiriman jawaban ganda untuk soal yang sama dalam satu attempt.
- Tentukan validasi status attempt agar attempt tidak dapat disubmit berulang kali.
- Gunakan transaksi database atau mekanisme atomik yang sesuai saat menyimpan hasil dan jawaban.
- Rancangan final constraint dan indeks harus dijelaskan sebelum migration dibuat.

## 9. Rancangan RESTful API Awal

Semua endpoint menggunakan prefix `/api`.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/health` | Memeriksa status server |
| GET | `/categories` | Mengambil daftar kategori |
| GET | `/categories/:id` | Mengambil detail kategori |
| GET | `/categories/:id/quizzes` | Mengambil kuis pada kategori |
| GET | `/quizzes` | Mengambil daftar kuis |
| GET | `/quizzes/daily` | Mengambil kuis harian |
| GET | `/quizzes/:id` | Mengambil detail kuis |
| GET | `/quizzes/:id/questions` | Mengambil soal tanpa kunci jawaban |
| POST | `/quizzes/:id/attempts` | Membuat attempt baru |
| POST | `/attempts/:id/submit` | Mengirim jawaban dan menghitung nilai |
| GET | `/attempts` | Mengambil riwayat pengguna terautentikasi |
| GET | `/attempts/:id` | Mengambil detail hasil attempt |

Endpoint administratif untuk mengelola kategori, kuis, soal, dan pilihan jawaban dapat ditambahkan jika dibutuhkan. Endpoint tersebut harus dilindungi autentikasi/otorisasi; jangan membuat endpoint tulis publik tanpa perlindungan.

### Aturan keamanan kuis
1. Endpoint pengambilan soal tidak boleh mengirim `is_correct`.
2. Frontend hanya mengirim pilihan jawaban pengguna, bukan nilai akhir.
3. Backend mengambil kunci jawaban dari database dan menghitung skor.
4. Backend memvalidasi bahwa attempt terkait dengan kuis yang benar dan belum disubmit.
5. Backend memvalidasi question ID dan option ID agar berasal dari kuis/soal yang sesuai.
6. Endpoint hasil hanya menampilkan pembahasan dan status benar/salah setelah attempt disubmit.
7. Validasi access token Supabase Auth di backend dan jangan mempercayai user ID dari request.

Format response API perlu distandardisasi, misalnya:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": []
}
```

Format error:
```json
{
  "success": false,
  "message": "A clear error message",
  "data": null
}
```

Sesuaikan format aktual secara konsisten dan dokumentasikan pada `API_CONTRACT.md`.

## 10. Struktur Folder yang Disarankan

Struktur ini adalah usulan awal. AI Agent harus meninjaunya dan menjelaskan perubahan yang diperlukan sebelum implementasi.

```text
QUIZORA/
├── AGENTS.md
├── README.md
├── PROJECT_CONTEXT.md
├── .gitignore
│
├── reference/
│   ├── Tugas_Akhir_PPB.png
│   ├── Modul_1_API.docx
│   ├── Modul_4_PWA_I.docx
│   └── Modul_5_PWA_II.docx
│
├── docs/
│   ├── REQUIREMENTS_CHECKLIST.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACT.md
│   ├── DEVELOPMENT_PLAN.md
│   ├── REFERENCE_GUIDE.md
│   └── SEED_QUESTION_BANK.md
│
├── frontend/
│   ├── public/
│   │   ├── icons/
│   │   └── offline.html
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── config/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── postman/
    └── Quizora_API.postman_collection.json
```

## 11. Integrasi Frontend

Ikuti pola pada Modul PWA II:
- `src/config/api.js` untuk konfigurasi Axios.
- Folder `services` untuk fungsi request API.
- Folder `hooks` untuk custom hooks yang mengelola data, loading, error, dan refetch.
- React Router untuk navigasi.
- Sesi login dikelola oleh Supabase Auth.

Contoh pembagian service:
- `categoryService.js`
- `quizService.js`
- `attemptService.js`

Contoh custom hooks:
- `useCategories.js`
- `useQuizzes.js`
- `useQuiz.js`
- `useQuizHistory.js`

Jangan meletakkan seluruh request API langsung di komponen halaman.

## 12. Ketentuan PWA dan Offline

Quizora harus menerapkan kemampuan PWA yang relevan:
- Web App Manifest dengan nama dan ikon Quizora.
- Display mode `standalone`.
- Ikon 192×192 dan 512×512.
- Service Worker.
- Cache application shell dan aset statis.
- Offline fallback yang informatif.
- Dukungan instalasi jika browser/perangkat mendukung.

Aturan cache:
- Cache aset statis dan data publik GET yang aman bila sesuai.
- Jangan cache request submit jawaban.
- Jangan cache atau menyimpan kunci jawaban pada frontend.
- Jangan menganggap fitur submit kuis dapat bekerja offline.
- Jika sesi kuis perlu bertahan sementara, simpan hanya data jawaban pengguna yang diperlukan dan sinkronkan melalui API ketika online; jelaskan batasan dan penanganan konflik.

### Catatan konsistensi modul
Modul PWA I menjelaskan Service Worker sebagai bagian PWA dan tujuan implementasinya, sedangkan contoh praktik menggunakan `vite-plugin-pwa`. Pilih satu pendekatan implementasi yang konsisten. Jangan mengaktifkan registrasi Service Worker manual dan plugin secara bersamaan tanpa alasan teknis yang jelas.

## 13. Desain UI/UX

Arah desain:
- Modern, bersih, minimalis, dan edukatif.
- Mobile-first.
- Latar putih atau netral terang.
- Warna utama navy atau indigo.
- Aksen ungu/biru seperlunya.
- Tipografi jelas dan mudah dibaca.
- Kartu dan tombol dengan sudut membulat secukupnya.
- Spacing konsisten.
- Timer dan progres kuis mudah terlihat.
- Bottom Navigation tetap mudah dijangkau.

Hindari animasi berlebihan, elemen dekoratif yang tidak membantu, dan tampilan yang terlalu padat.

## 14. Pengujian dan Kriteria Penerimaan

### Fungsional
- Semua halaman dapat dibuka.
- Bottom Navigation bekerja.
- Kategori dapat dipilih dan membuka detail.
- Kuis dapat dipilih dan membuka detail.
- Kuis dapat dimulai.
- Jawaban dapat dipilih dan diubah sebelum submit.
- Timer berjalan sesuai ketentuan.
- Submit menghasilkan skor dari backend.
- Hasil dan pembahasan tampil setelah submit.
- Riwayat tersimpan dan dapat dibuka.
- Riwayat kuis dikaitkan dengan ID pengguna yang telah diverifikasi.

### API dan keamanan
- Endpoint diuji menggunakan Postman.
- Status code sesuai.
- Validasi input bekerja.
- Error ditangani secara konsisten.
- Kunci jawaban tidak bocor sebelum submit.
- Skor tidak dapat dimanipulasi dari frontend.
- Kredensial rahasia tidak masuk repository.

### PWA
- Manifest valid.
- Service Worker terdaftar.
- Aplikasi dapat diinstal pada browser/perangkat yang mendukung.
- Aset inti dapat dibuka sesuai strategi cache.
- Offline fallback tampil saat jaringan terputus.
- Submit kuis tidak berpura-pura berhasil ketika offline.

### Build dan repository
- Frontend berhasil menjalankan `npm run build`.
- Backend dapat dijalankan dan health endpoint merespons.
- Tidak ada error kritis pada console.
- Source code diunggah ke GitHub.
- File `.env` dan secret tidak diunggah.

## 15. Tahapan Pengembangan

| Fase | Pekerjaan | Kriteria selesai |
|---|---|---|
| 0 | Analisis dokumen dan perencanaan | Arsitektur, skema DB, API, struktur folder, dan checklist disetujui |
| 1 | Inisialisasi proyek | Frontend/backend berjalan dengan konfigurasi dasar |
| 2 | Database | Tabel, relasi, constraint, dan seed data siap |
| 3 | Backend API | Endpoint inti berjalan |
| 4 | Pengujian API | Endpoint inti lulus pengujian Postman |
| 5 | Frontend | Semua halaman dan navigasi tersedia |
| 6 | Integrasi API | Data aplikasi berasal dari backend |
| 7 | PWA | Manifest, Service Worker, instalasi, dan offline fallback diuji |
| 8 | Pengujian akhir | Persyaratan dosen dan alur utama lulus |
| 9 | Deployment | Repository GitHub dan deployment tersedia |

## 16. Aturan Kerja untuk AI Agent

1. Baca dokumen konteks dan referensi sebelum mengubah kode.
2. Mulai dari analisis, jangan langsung membuat seluruh aplikasi.
3. Pada Fase 0, jangan membuat atau menimpa source code.
4. Tampilkan rancangan dan minta persetujuan sebelum implementasi.
5. Kerjakan satu fase pada satu waktu.
6. Sebelum mengubah file, periksa struktur dan isi file yang sudah ada.
7. Jangan menghapus fitur yang sudah berjalan tanpa persetujuan.
8. Jangan mengarang hasil pengujian. Jalankan perintah dan laporkan hasil sebenarnya.
9. Jika ada keputusan teknis yang belum jelas, jelaskan pilihan dan dampaknya.
10. Berikan ringkasan file yang dibuat/diubah pada akhir setiap fase.
11. Jelaskan keputusan penting dengan bahasa sederhana agar mahasiswa dapat memahami dan mempertanggungjawabkan proyek.
12. Utamakan kesesuaian dengan ketentuan tugas dan materi praktikum daripada menambah fitur yang tidak diperlukan.

## 17. Instruksi Pertama untuk AI Agent

Lakukan Fase 0 saja.

1. Periksa workspace.
2. Baca `AGENTS.md`, dokumen konteks ini, screenshot tugas, dan ketiga modul praktikum.
3. Petakan tujuh ketentuan dosen ke fitur dan halaman Quizora.
4. Tinjau rancangan database dan identifikasi constraint yang masih perlu diputuskan.
5. Tinjau rancangan endpoint dan format request/response.
6. Usulkan struktur folder frontend/backend final.
7. Identifikasi risiko keamanan, integrasi, PWA, dan deployment.
8. Buat development plan dengan acceptance criteria.
9. Laporkan asumsi dan pertanyaan yang harus diputuskan.

**Jangan membuat atau mengubah source code pada tahap ini. Tunggu persetujuan pengguna sebelum memulai Fase 1.**
