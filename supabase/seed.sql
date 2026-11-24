BEGIN;

INSERT INTO public.categories (name, slug, description, icon_name)
VALUES
  (
    'Sains dan Alam',
    'sains-dan-alam',
    'Kuis tentang sains dasar dan fenomena alam.',
    'flask-conical'
  ),
  (
    'Geografi',
    'geografi',
    'Kenali bumi, wilayah, dan tempat-tempat di dunia.',
    'globe-2'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name;

INSERT INTO public.quizzes (
  id,
  category_id,
  title,
  description,
  difficulty,
  duration_seconds,
  is_daily,
  daily_date,
  is_published
)
SELECT
  quiz.id::uuid,
  category.id,
  quiz.title,
  quiz.description,
  quiz.difficulty,
  quiz.duration_seconds,
  false,
  null,
  true
FROM (
  VALUES
    (
      '00000000-0000-4000-8000-000000000101',
      'sains-dan-alam',
      'Dasar-Dasar Sains',
      'Uji pemahamanmu tentang konsep sains yang dekat dengan kehidupan sehari-hari.',
      'easy',
      300
    ),
    (
      '00000000-0000-4000-8000-000000000102',
      'geografi',
      'Jelajah Dunia',
      'Pertanyaan singkat tentang benua, samudra, dan geografi dunia.',
      'medium',
      360
    )
) AS quiz(id, category_slug, title, description, difficulty, duration_seconds)
JOIN public.categories AS category
  ON category.slug = quiz.category_slug
WHERE true
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  duration_seconds = EXCLUDED.duration_seconds,
  is_daily = EXCLUDED.is_daily,
  daily_date = EXCLUDED.daily_date,
  is_published = EXCLUDED.is_published;

INSERT INTO public.questions (id, quiz_id, question_text, explanation, points, order_number)
VALUES
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101',
    'Planet apa yang dikenal sebagai Planet Merah?',
    'Mars tampak kemerahan karena banyak mengandung oksida besi pada permukaannya.',
    10,
    1
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000101',
    'Apa nama proses tumbuhan membuat makanan dengan bantuan cahaya matahari?',
    'Fotosintesis mengubah energi cahaya menjadi energi kimia yang tersimpan dalam gula.',
    10,
    2
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000101',
    'Pada tekanan udara normal, berapa titik didih air dalam derajat Celsius?',
    'Air mendidih pada suhu 100°C pada tekanan atmosfer standar.',
    10,
    3
  ),
  (
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000102',
    'Samudra terluas di bumi adalah samudra apa?',
    'Samudra Pasifik merupakan samudra terbesar dan mencakup area yang sangat luas di antara Asia, Australia, dan Amerika.',
    10,
    1
  ),
  (
    '00000000-0000-4000-8000-000000000205',
    '00000000-0000-4000-8000-000000000102',
    'Ibu kota Jepang adalah kota apa?',
    'Tokyo adalah ibu kota Jepang dan salah satu kawasan metropolitan terbesar di dunia.',
    10,
    2
  ),
  (
    '00000000-0000-4000-8000-000000000206',
    '00000000-0000-4000-8000-000000000102',
    'Benua manakah yang seluruh wilayah daratannya berada di belahan bumi selatan?',
    'Antarktika terletak di sekitar Kutub Selatan dan seluruh wilayahnya berada di belahan bumi selatan.',
    10,
    3
  )
ON CONFLICT (id) DO UPDATE SET
  quiz_id = EXCLUDED.quiz_id,
  question_text = EXCLUDED.question_text,
  explanation = EXCLUDED.explanation,
  points = EXCLUDED.points,
  order_number = EXCLUDED.order_number;

INSERT INTO public.answer_options (id, question_id, option_label, option_text, is_correct)
VALUES
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201', 'A', 'Venus', false),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000201', 'B', 'Mars', true),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000201', 'C', 'Jupiter', false),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000201', 'D', 'Neptunus', false),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000202', 'A', 'Evaporasi', false),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000202', 'B', 'Fotosintesis', true),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000202', 'C', 'Kondensasi', false),
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000202', 'D', 'Fermentasi', false),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000203', 'A', '0°C', false),
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000203', 'B', '50°C', false),
  ('00000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000203', 'C', '100°C', true),
  ('00000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000203', 'D', '150°C', false),
  ('00000000-0000-4000-8000-000000000313', '00000000-0000-4000-8000-000000000204', 'A', 'Samudra Atlantik', false),
  ('00000000-0000-4000-8000-000000000314', '00000000-0000-4000-8000-000000000204', 'B', 'Samudra Hindia', false),
  ('00000000-0000-4000-8000-000000000315', '00000000-0000-4000-8000-000000000204', 'C', 'Samudra Arktik', false),
  ('00000000-0000-4000-8000-000000000316', '00000000-0000-4000-8000-000000000204', 'D', 'Samudra Pasifik', true),
  ('00000000-0000-4000-8000-000000000317', '00000000-0000-4000-8000-000000000205', 'A', 'Kyoto', false),
  ('00000000-0000-4000-8000-000000000318', '00000000-0000-4000-8000-000000000205', 'B', 'Tokyo', true),
  ('00000000-0000-4000-8000-000000000319', '00000000-0000-4000-8000-000000000205', 'C', 'Osaka', false),
  ('00000000-0000-4000-8000-000000000320', '00000000-0000-4000-8000-000000000205', 'D', 'Sapporo', false),
  ('00000000-0000-4000-8000-000000000321', '00000000-0000-4000-8000-000000000206', 'A', 'Eropa', false),
  ('00000000-0000-4000-8000-000000000322', '00000000-0000-4000-8000-000000000206', 'B', 'Asia', false),
  ('00000000-0000-4000-8000-000000000323', '00000000-0000-4000-8000-000000000206', 'C', 'Antarktika', true),
  ('00000000-0000-4000-8000-000000000324', '00000000-0000-4000-8000-000000000206', 'D', 'Amerika Utara', false)
ON CONFLICT (id) DO UPDATE SET
  question_id = EXCLUDED.question_id,
  option_label = EXCLUDED.option_label,
  option_text = EXCLUDED.option_text,
  is_correct = EXCLUDED.is_correct;

-- Upsert kategori yang diperlukan. Kategori Matematika ditambahkan di sini.
INSERT INTO public.categories (id, name, slug, description, icon_name)
VALUES
  (gen_random_uuid(), 'Sains dan Alam', 'sains-dan-alam', 'Kuis analitis tentang sains, fisika, biologi, dan kimia.', 'flask-conical'),
  (gen_random_uuid(), 'Geografi', 'geografi', 'Kuis analitis tentang dinamika bumi, iklim, peta, dan kependudukan.', 'globe-2'),
  (gen_random_uuid(), 'Matematika', 'matematika', 'Kuis penalaran kuantitatif, aljabar, statistika, peluang, dan geometri.', 'calculator')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name;

-- ID kuis 110-116 menghindari konflik dengan paket lama 103-107 pada seed Quizora.
-- Upsert paket kuis. is_daily tetap false karena penjadwalan dikelola oleh daily_quiz_schedule.
INSERT INTO public.quizzes (id, category_id, title, description, difficulty, duration_seconds, is_daily, daily_date, is_published)
SELECT v.id::uuid, c.id, v.title, v.description, v.difficulty, v.duration_seconds, false, NULL, true
FROM (VALUES
('00000000-0000-4000-8000-000000000110', 'matematika', 'Aljabar, Fungsi, dan Barisan', 'Uji kemampuan menyelesaikan persamaan, menganalisis fungsi kuadrat, dan menentukan pola barisan.', 'medium', 300),
('00000000-0000-4000-8000-000000000111', 'matematika', 'Peluang dan Statistika Terapan', 'Analisis peluang kejadian, ukuran pemusatan data, dan variasi statistik melalui perhitungan.', 'medium', 300),
('00000000-0000-4000-8000-000000000112', 'matematika', 'Geometri dan Fungsi Praktis', 'Selesaikan persoalan geometri, komposisi fungsi, luas, volume, dan persamaan garis.', 'medium', 300),
('00000000-0000-4000-8000-000000000113', 'sains-dan-alam', 'Fisika: Gerak, Gaya, dan Listrik', 'Terapkan konsep kinematika, dinamika, energi, dan rangkaian listrik dalam situasi kuantitatif.', 'medium', 300),
('00000000-0000-4000-8000-000000000114', 'sains-dan-alam', 'Biologi dan Kimia Konseptual', 'Analisis hubungan struktur dan fungsi biologis serta konsep dasar kimia kuantitatif.', 'medium', 300),
('00000000-0000-4000-8000-000000000115', 'geografi', 'Dinamika Bumi, Iklim, dan Tektonik', 'Pahami proses atmosfer, pola iklim, rotasi bumi, dan interaksi lempeng tektonik.', 'medium', 300),
('00000000-0000-4000-8000-000000000116', 'geografi', 'Analisis Peta dan Demografi', 'Gunakan skala peta, kepadatan penduduk, rasio ketergantungan, dan dinamika populasi untuk membaca fenomena wilayah.', 'medium', 300)
) AS v(id, category_slug, title, description, difficulty, duration_seconds)
JOIN public.categories c ON c.slug = v.category_slug
WHERE true
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  duration_seconds = EXCLUDED.duration_seconds,
  is_daily = false,
  daily_date = NULL,
  is_published = true;

-- Insert/update pertanyaan. ID dimulai dari 207 agar tidak bertabrakan dengan seed awal (201-206).
INSERT INTO public.questions (id, quiz_id, question_text, explanation, points, order_number)
VALUES
('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000110', 'Sebuah toko menjual 3 buku dengan harga sama. Setelah ditambah biaya bungkus Rp4.000, totalnya Rp19.000. Berapa harga satu buku?', 'Misalkan harga satu buku x. Maka 3x + Rp4.000 = Rp19.000, sehingga 3x = Rp15.000 dan x = Rp5.000.', 10, 1),
('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000110', 'Jika f(x) = 2x - 1, berapakah nilai f(3)?', 'Ganti x dengan 3: f(3) = 2(3) - 1 = 5.', 10, 2),
('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000110', 'Barisan 7, 12, 17, ... bertambah dengan selisih tetap. Berapakah suku berikutnya?', 'Setiap suku bertambah 5, jadi suku berikutnya adalah 17 + 5 = 22.', 10, 3),
('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000110', 'Persamaan x² - 5x + 6 = 0 memiliki dua akar. Apa akar yang lebih kecil?', 'Faktorkan menjadi (x - 2)(x - 3) = 0. Akarnya 2 dan 3, jadi yang lebih kecil adalah 2.', 10, 4),
('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000110', 'Diketahui 2x + y = 11 dan x = 4. Berapa nilai y?', 'Substitusikan x = 4: 2(4) + y = 11, sehingga y = 3.', 10, 5),
('00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000111', 'Sebuah dadu adil dilempar sekali. Berapa peluang muncul angka 6?', 'Ada satu hasil yang diinginkan dari enam sisi yang sama mungkin, jadi peluangnya 1/6.', 10, 1),
('00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000111', 'Rata-rata nilai empat kuis adalah 80. Tiga nilai pertama berjumlah 230. Berapa nilai kuis keempat?', 'Jumlah seluruh nilai adalah 4 × 80 = 320. Nilai keempat adalah 320 - 230 = 90.', 10, 2),
('00000000-0000-4000-8000-000000000214', '00000000-0000-4000-8000-000000000111', 'Data terurut 3, 5, 8, 9, 12 memiliki median berapa?', 'Karena ada lima data yang sudah terurut, median adalah nilai tengah, yaitu 8.', 10, 3),
('00000000-0000-4000-8000-000000000215', '00000000-0000-4000-8000-000000000111', 'Satu kartu diambil dari set kartu remi 52 kartu. Berapa peluang mendapat kartu hati?', 'Ada 13 kartu hati dari 52 kartu, jadi peluangnya 13/52 = 1/4.', 10, 4),
('00000000-0000-4000-8000-000000000216', '00000000-0000-4000-8000-000000000111', 'Berapakah rentang data 2, 4, 6, 8, 10?', 'Rentang adalah nilai terbesar dikurangi nilai terkecil: 10 - 2 = 8.', 10, 5),
('00000000-0000-4000-8000-000000000217', '00000000-0000-4000-8000-000000000112', 'Segitiga memiliki alas 10 cm dan tinggi 6 cm. Berapa luasnya?', 'Luas segitiga = 1/2 × alas × tinggi = 1/2 × 10 × 6 = 30 cm².', 10, 1),
('00000000-0000-4000-8000-000000000218', '00000000-0000-4000-8000-000000000112', 'Sebuah juring memiliki jari-jari 10 cm dan sudut pusat 90°. Berapa luasnya?', 'Sudut 90° adalah seperempat lingkaran. Luas juring = 1/4 × π × 10² = 25π cm².', 10, 2),
('00000000-0000-4000-8000-000000000219', '00000000-0000-4000-8000-000000000112', 'Jika f(x) = x + 2 dan g(x) = 3x, berapa nilai (g ∘ f)(2)?', '(g ∘ f)(2) = g(f(2)). Karena f(2) = 4, maka g(4) = 12.', 10, 3),
('00000000-0000-4000-8000-000000000220', '00000000-0000-4000-8000-000000000112', 'Tabung berjari-jari 2 cm dan tinggi 5 cm. Berapa volumenya?', 'Volume tabung = πr²h = π × 2² × 5 = 20π cm³.', 10, 4),
('00000000-0000-4000-8000-000000000221', '00000000-0000-4000-8000-000000000112', 'Garis y = 2x + 3 memotong sumbu-y di angka berapa?', 'Pada sumbu-y, x = 0. Maka y = 2(0) + 3 = 3.', 10, 5),
('00000000-0000-4000-8000-000000000222', '00000000-0000-4000-8000-000000000113', 'Kecepatan mobil berubah dari 0 menjadi 20 m/s dalam 5 sekon. Berapa percepatannya?', 'Percepatan = perubahan kecepatan / waktu = (20 - 0)/5 = 4 m/s².', 10, 1),
('00000000-0000-4000-8000-000000000223', '00000000-0000-4000-8000-000000000113', 'Benda dijatuhkan dari ketinggian 20 m. Jika g = 10 m/s² dan hambatan udara diabaikan, berapa waktu jatuhnya?', 'Gunakan h = 1/2 gt²: 20 = 5t², sehingga t² = 4 dan waktu positifnya 2 sekon.', 10, 2),
('00000000-0000-4000-8000-000000000224', '00000000-0000-4000-8000-000000000113', 'Resistor 4 Ω dan 6 Ω disusun seri lalu dihubungkan ke 20 V. Berapa arusnya?', 'Hambatan total = 4 + 6 = 10 Ω. Hukum Ohm memberi I = V/R = 20/10 = 2 A.', 10, 3),
('00000000-0000-4000-8000-000000000225', '00000000-0000-4000-8000-000000000113', 'Gaya 12 N bekerja pada benda bermassa 3 kg. Berapa percepatannya?', 'Menurut F = ma, percepatan a = F/m = 12/3 = 4 m/s².', 10, 4),
('00000000-0000-4000-8000-000000000226', '00000000-0000-4000-8000-000000000113', 'Benda bermassa 2 kg bergerak dengan kecepatan 5 m/s. Berapa energi kinetiknya?', 'Energi kinetik = 1/2 mv² = 1/2 × 2 × 5² = 25 J.', 10, 5),
('00000000-0000-4000-8000-000000000227', '00000000-0000-4000-8000-000000000114', 'Pada suhu sekitar 25°C, pH berapakah yang menunjukkan larutan netral?', 'Pada suhu sekitar 25°C, larutan netral memiliki pH 7.', 10, 1),
('00000000-0000-4000-8000-000000000228', '00000000-0000-4000-8000-000000000114', 'Dalam DNA, basa nitrogen A berpasangan dengan basa apa?', 'Pada DNA, adenin (A) berpasangan dengan timin (T).', 10, 2),
('00000000-0000-4000-8000-000000000229', '00000000-0000-4000-8000-000000000114', 'Mengapa suhu yang terlalu tinggi dapat menurunkan kerja enzim?', 'Suhu berlebihan dapat mengubah bentuk tiga dimensi enzim, termasuk sisi aktif tempat substrat berikatan.', 10, 3),
('00000000-0000-4000-8000-000000000230', '00000000-0000-4000-8000-000000000114', 'Dalam spermatogenesis, satu sel induk diploid menyelesaikan meiosis. Berapa spermatid haploid biasanya dihasilkan?', 'Dalam spermatogenesis, meiosis menghasilkan empat spermatid haploid dari satu sel induk diploid.', 10, 4),
('00000000-0000-4000-8000-000000000231', '00000000-0000-4000-8000-000000000114', 'Sebanyak 0,5 mol zat dilarutkan hingga volume 2 liter. Berapa molaritasnya?', 'Molaritas = jumlah mol / volume = 0,5/2 = 0,25 mol/L atau 0,25 M.', 10, 5),
('00000000-0000-4000-8000-000000000232', '00000000-0000-4000-8000-000000000115', 'Garis khatulistiwa membagi bumi menjadi belahan apa?', 'Khatulistiwa berada pada lintang 0° dan memisahkan belahan bumi utara dan selatan.', 10, 1),
('00000000-0000-4000-8000-000000000233', '00000000-0000-4000-8000-000000000115', 'Mengapa sisi pegunungan yang menghadap angin lembap biasanya lebih sering hujan?', 'Udara lembap terdorong naik, mendingin, lalu uap airnya mengembun dan turun sebagai hujan.', 10, 2),
('00000000-0000-4000-8000-000000000234', '00000000-0000-4000-8000-000000000115', 'Pada batas konvergen, dua lempeng bumi bergerak bagaimana?', 'Batas konvergen adalah daerah tempat dua lempeng bergerak saling mendekat.', 10, 3),
('00000000-0000-4000-8000-000000000235', '00000000-0000-4000-8000-000000000115', 'Kota B berada 15° lebih ke timur daripada Kota A. Perbedaan waktu matahari lokalnya kira-kira berapa?', 'Bumi berputar sekitar 15° setiap jam. Kota yang lebih ke timur mengalami waktu matahari lokal sekitar satu jam lebih dahulu.', 10, 4),
('00000000-0000-4000-8000-000000000236', '00000000-0000-4000-8000-000000000115', 'El Niño umumnya membuat curah hujan di Indonesia menjadi bagaimana?', 'El Niño sering mengurangi curah hujan di Indonesia dan meningkatkan risiko kekeringan, meski dampaknya dapat berbeda menurut musim.', 10, 5),
('00000000-0000-4000-8000-000000000237', '00000000-0000-4000-8000-000000000116', 'Pada peta berskala 1:100.000, jarak dua tempat adalah 3 cm. Berapa jarak sebenarnya?', 'Skala tersebut berarti 1 cm mewakili 100.000 cm atau 1 km. Jadi 3 cm mewakili 3 km.', 10, 1),
('00000000-0000-4000-8000-000000000238', '00000000-0000-4000-8000-000000000116', 'Wilayah berpenduduk 600.000 jiwa dengan luas 300 km². Berapa kepadatan rata-ratanya?', 'Kepadatan = jumlah penduduk / luas = 600.000/300 = 2.000 jiwa per km².', 10, 2),
('00000000-0000-4000-8000-000000000239', '00000000-0000-4000-8000-000000000116', 'Sebuah wilayah memiliki 30.000 penduduk usia nonproduktif dan 60.000 usia produktif. Berapa rasio ketergantungannya?', 'Rasio ketergantungan = 30.000/60.000 × 100 = 50 penduduk nonproduktif per 100 penduduk produktif.', 10, 3),
('00000000-0000-4000-8000-000000000240', '00000000-0000-4000-8000-000000000116', 'Pada peta kontur, garis yang sangat berdekatan biasanya menunjukkan medan seperti apa?', 'Garis kontur yang berdekatan menandakan perubahan ketinggian dalam jarak pendek, yaitu lereng curam.', 10, 4),
('00000000-0000-4000-8000-000000000241', '00000000-0000-4000-8000-000000000116', 'Sebuah kota mencatat 1.000 kelahiran dan 800 kematian, tanpa migrasi. Berapa pertambahan bersih penduduknya?', 'Pertambahan bersih = kelahiran - kematian = 1.000 - 800 = 200 jiwa.', 10, 5)
ON CONFLICT (id) DO UPDATE SET
  quiz_id = EXCLUDED.quiz_id,
  question_text = EXCLUDED.question_text,
  explanation = EXCLUDED.explanation,
  points = EXCLUDED.points,
  order_number = EXCLUDED.order_number;

-- Insert/update empat opsi per pertanyaan, dengan tepat satu kunci jawaban.
INSERT INTO public.answer_options (id, question_id, option_label, option_text, is_correct)
VALUES
('00000000-0000-4000-8000-000000000325', '00000000-0000-4000-8000-000000000207', 'A', 'Rp4.000', false),
('00000000-0000-4000-8000-000000000326', '00000000-0000-4000-8000-000000000207', 'B', 'Rp5.000', true),
('00000000-0000-4000-8000-000000000327', '00000000-0000-4000-8000-000000000207', 'C', 'Rp6.000', false),
('00000000-0000-4000-8000-000000000328', '00000000-0000-4000-8000-000000000207', 'D', 'Rp7.000', false),
('00000000-0000-4000-8000-000000000329', '00000000-0000-4000-8000-000000000208', 'A', '4', false),
('00000000-0000-4000-8000-000000000330', '00000000-0000-4000-8000-000000000208', 'B', '5', true),
('00000000-0000-4000-8000-000000000331', '00000000-0000-4000-8000-000000000208', 'C', '6', false),
('00000000-0000-4000-8000-000000000332', '00000000-0000-4000-8000-000000000208', 'D', '7', false),
('00000000-0000-4000-8000-000000000333', '00000000-0000-4000-8000-000000000209', 'A', '21', false),
('00000000-0000-4000-8000-000000000334', '00000000-0000-4000-8000-000000000209', 'B', '23', false),
('00000000-0000-4000-8000-000000000335', '00000000-0000-4000-8000-000000000209', 'C', '22', true),
('00000000-0000-4000-8000-000000000336', '00000000-0000-4000-8000-000000000209', 'D', '24', false),
('00000000-0000-4000-8000-000000000337', '00000000-0000-4000-8000-000000000210', 'A', '1', false),
('00000000-0000-4000-8000-000000000338', '00000000-0000-4000-8000-000000000210', 'B', '2', true),
('00000000-0000-4000-8000-000000000339', '00000000-0000-4000-8000-000000000210', 'C', '3', false),
('00000000-0000-4000-8000-000000000340', '00000000-0000-4000-8000-000000000210', 'D', '6', false),
('00000000-0000-4000-8000-000000000341', '00000000-0000-4000-8000-000000000211', 'A', '2', false),
('00000000-0000-4000-8000-000000000342', '00000000-0000-4000-8000-000000000211', 'B', '3', true),
('00000000-0000-4000-8000-000000000343', '00000000-0000-4000-8000-000000000211', 'C', '4', false),
('00000000-0000-4000-8000-000000000344', '00000000-0000-4000-8000-000000000211', 'D', '5', false),
('00000000-0000-4000-8000-000000000345', '00000000-0000-4000-8000-000000000212', 'A', '1/2', false),
('00000000-0000-4000-8000-000000000346', '00000000-0000-4000-8000-000000000212', 'B', '1/6', true),
('00000000-0000-4000-8000-000000000347', '00000000-0000-4000-8000-000000000212', 'C', '1/3', false),
('00000000-0000-4000-8000-000000000348', '00000000-0000-4000-8000-000000000212', 'D', '1/12', false),
('00000000-0000-4000-8000-000000000349', '00000000-0000-4000-8000-000000000213', 'A', '85', false),
('00000000-0000-4000-8000-000000000350', '00000000-0000-4000-8000-000000000213', 'B', '90', true),
('00000000-0000-4000-8000-000000000351', '00000000-0000-4000-8000-000000000213', 'C', '95', false),
('00000000-0000-4000-8000-000000000352', '00000000-0000-4000-8000-000000000213', 'D', '100', false),
('00000000-0000-4000-8000-000000000353', '00000000-0000-4000-8000-000000000214', 'A', '5', false),
('00000000-0000-4000-8000-000000000354', '00000000-0000-4000-8000-000000000214', 'B', '7', false),
('00000000-0000-4000-8000-000000000355', '00000000-0000-4000-8000-000000000214', 'C', '8', true),
('00000000-0000-4000-8000-000000000356', '00000000-0000-4000-8000-000000000214', 'D', '9', false),
('00000000-0000-4000-8000-000000000357', '00000000-0000-4000-8000-000000000215', 'A', '1/13', false),
('00000000-0000-4000-8000-000000000358', '00000000-0000-4000-8000-000000000215', 'B', '1/4', true),
('00000000-0000-4000-8000-000000000359', '00000000-0000-4000-8000-000000000215', 'C', '1/2', false),
('00000000-0000-4000-8000-000000000360', '00000000-0000-4000-8000-000000000215', 'D', '1/3', false),
('00000000-0000-4000-8000-000000000361', '00000000-0000-4000-8000-000000000216', 'A', '6', false),
('00000000-0000-4000-8000-000000000362', '00000000-0000-4000-8000-000000000216', 'B', '8', true),
('00000000-0000-4000-8000-000000000363', '00000000-0000-4000-8000-000000000216', 'C', '10', false),
('00000000-0000-4000-8000-000000000364', '00000000-0000-4000-8000-000000000216', 'D', '12', false),
('00000000-0000-4000-8000-000000000365', '00000000-0000-4000-8000-000000000217', 'A', '20 cm²', false),
('00000000-0000-4000-8000-000000000366', '00000000-0000-4000-8000-000000000217', 'B', '30 cm²', true),
('00000000-0000-4000-8000-000000000367', '00000000-0000-4000-8000-000000000217', 'C', '40 cm²', false),
('00000000-0000-4000-8000-000000000368', '00000000-0000-4000-8000-000000000217', 'D', '60 cm²', false),
('00000000-0000-4000-8000-000000000369', '00000000-0000-4000-8000-000000000218', 'A', '10π cm²', false),
('00000000-0000-4000-8000-000000000370', '00000000-0000-4000-8000-000000000218', 'B', '25π cm²', true),
('00000000-0000-4000-8000-000000000371', '00000000-0000-4000-8000-000000000218', 'C', '50π cm²', false),
('00000000-0000-4000-8000-000000000372', '00000000-0000-4000-8000-000000000218', 'D', '100π cm²', false),
('00000000-0000-4000-8000-000000000373', '00000000-0000-4000-8000-000000000219', 'A', '8', false),
('00000000-0000-4000-8000-000000000374', '00000000-0000-4000-8000-000000000219', 'B', '10', false),
('00000000-0000-4000-8000-000000000375', '00000000-0000-4000-8000-000000000219', 'C', '12', true),
('00000000-0000-4000-8000-000000000376', '00000000-0000-4000-8000-000000000219', 'D', '14', false),
('00000000-0000-4000-8000-000000000377', '00000000-0000-4000-8000-000000000220', 'A', '10π cm³', false),
('00000000-0000-4000-8000-000000000378', '00000000-0000-4000-8000-000000000220', 'B', '20π cm³', true),
('00000000-0000-4000-8000-000000000379', '00000000-0000-4000-8000-000000000220', 'C', '25π cm³', false),
('00000000-0000-4000-8000-000000000380', '00000000-0000-4000-8000-000000000220', 'D', '40π cm³', false),
('00000000-0000-4000-8000-000000000381', '00000000-0000-4000-8000-000000000221', 'A', '1', false),
('00000000-0000-4000-8000-000000000382', '00000000-0000-4000-8000-000000000221', 'B', '2', false),
('00000000-0000-4000-8000-000000000383', '00000000-0000-4000-8000-000000000221', 'C', '3', true),
('00000000-0000-4000-8000-000000000384', '00000000-0000-4000-8000-000000000221', 'D', '4', false),
('00000000-0000-4000-8000-000000000385', '00000000-0000-4000-8000-000000000222', 'A', '2 m/s²', false),
('00000000-0000-4000-8000-000000000386', '00000000-0000-4000-8000-000000000222', 'B', '4 m/s²', true),
('00000000-0000-4000-8000-000000000387', '00000000-0000-4000-8000-000000000222', 'C', '5 m/s²', false),
('00000000-0000-4000-8000-000000000388', '00000000-0000-4000-8000-000000000222', 'D', '10 m/s²', false),
('00000000-0000-4000-8000-000000000389', '00000000-0000-4000-8000-000000000223', 'A', '1 sekon', false),
('00000000-0000-4000-8000-000000000390', '00000000-0000-4000-8000-000000000223', 'B', '2 sekon', true),
('00000000-0000-4000-8000-000000000391', '00000000-0000-4000-8000-000000000223', 'C', '3 sekon', false),
('00000000-0000-4000-8000-000000000392', '00000000-0000-4000-8000-000000000223', 'D', '4 sekon', false),
('00000000-0000-4000-8000-000000000393', '00000000-0000-4000-8000-000000000224', 'A', '1 A', false),
('00000000-0000-4000-8000-000000000394', '00000000-0000-4000-8000-000000000224', 'B', '2 A', true),
('00000000-0000-4000-8000-000000000395', '00000000-0000-4000-8000-000000000224', 'C', '3 A', false),
('00000000-0000-4000-8000-000000000396', '00000000-0000-4000-8000-000000000224', 'D', '5 A', false),
('00000000-0000-4000-8000-000000000397', '00000000-0000-4000-8000-000000000225', 'A', '3 m/s²', false),
('00000000-0000-4000-8000-000000000398', '00000000-0000-4000-8000-000000000225', 'B', '4 m/s²', true),
('00000000-0000-4000-8000-000000000399', '00000000-0000-4000-8000-000000000225', 'C', '6 m/s²', false),
('00000000-0000-4000-8000-000000000400', '00000000-0000-4000-8000-000000000225', 'D', '9 m/s²', false),
('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000226', 'A', '10 J', false),
('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000226', 'B', '20 J', false),
('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000226', 'C', '25 J', true),
('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000226', 'D', '50 J', false),
('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000227', 'A', '3', false),
('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000227', 'B', '5', false),
('00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000227', 'C', '7', true),
('00000000-0000-4000-8000-000000000408', '00000000-0000-4000-8000-000000000227', 'D', '9', false),
('00000000-0000-4000-8000-000000000409', '00000000-0000-4000-8000-000000000228', 'A', 'A', false),
('00000000-0000-4000-8000-000000000410', '00000000-0000-4000-8000-000000000228', 'B', 'G', false),
('00000000-0000-4000-8000-000000000411', '00000000-0000-4000-8000-000000000228', 'C', 'T', true),
('00000000-0000-4000-8000-000000000412', '00000000-0000-4000-8000-000000000228', 'D', 'U', false),
('00000000-0000-4000-8000-000000000413', '00000000-0000-4000-8000-000000000229', 'A', 'Laju reaksi selalu bertambah', false),
('00000000-0000-4000-8000-000000000414', '00000000-0000-4000-8000-000000000229', 'B', 'Bentuk sisi aktif enzim dapat berubah', true),
('00000000-0000-4000-8000-000000000415', '00000000-0000-4000-8000-000000000229', 'C', 'Jumlah enzim otomatis bertambah', false),
('00000000-0000-4000-8000-000000000416', '00000000-0000-4000-8000-000000000229', 'D', 'Substrat berubah menjadi enzim', false),
('00000000-0000-4000-8000-000000000417', '00000000-0000-4000-8000-000000000230', 'A', 'Dua sel diploid', false),
('00000000-0000-4000-8000-000000000418', '00000000-0000-4000-8000-000000000230', 'B', 'Empat sel haploid', true),
('00000000-0000-4000-8000-000000000419', '00000000-0000-4000-8000-000000000230', 'C', 'Dua sel haploid', false),
('00000000-0000-4000-8000-000000000420', '00000000-0000-4000-8000-000000000230', 'D', 'Empat sel diploid', false),
('00000000-0000-4000-8000-000000000421', '00000000-0000-4000-8000-000000000231', 'A', '0,10 M', false),
('00000000-0000-4000-8000-000000000422', '00000000-0000-4000-8000-000000000231', 'B', '0,25 M', true),
('00000000-0000-4000-8000-000000000423', '00000000-0000-4000-8000-000000000231', 'C', '0,50 M', false),
('00000000-0000-4000-8000-000000000424', '00000000-0000-4000-8000-000000000231', 'D', '1,00 M', false),
('00000000-0000-4000-8000-000000000425', '00000000-0000-4000-8000-000000000232', 'A', 'Utara dan selatan', true),
('00000000-0000-4000-8000-000000000426', '00000000-0000-4000-8000-000000000232', 'B', 'Timur dan barat', false),
('00000000-0000-4000-8000-000000000427', '00000000-0000-4000-8000-000000000232', 'C', 'Daratan dan lautan', false),
('00000000-0000-4000-8000-000000000428', '00000000-0000-4000-8000-000000000232', 'D', 'Tropis dan kutub', false),
('00000000-0000-4000-8000-000000000429', '00000000-0000-4000-8000-000000000233', 'A', 'Udara naik, mendingin, lalu mengembun', true),
('00000000-0000-4000-8000-000000000430', '00000000-0000-4000-8000-000000000233', 'B', 'Udara turun dan selalu menghangat', false),
('00000000-0000-4000-8000-000000000431', '00000000-0000-4000-8000-000000000233', 'C', 'Tekanan udara menjadi nol', false),
('00000000-0000-4000-8000-000000000432', '00000000-0000-4000-8000-000000000233', 'D', 'Penguapan laut berhenti', false),
('00000000-0000-4000-8000-000000000433', '00000000-0000-4000-8000-000000000234', 'A', 'Saling mendekat', true),
('00000000-0000-4000-8000-000000000434', '00000000-0000-4000-8000-000000000234', 'B', 'Saling menjauh', false),
('00000000-0000-4000-8000-000000000435', '00000000-0000-4000-8000-000000000234', 'C', 'Bergeser sejajar saja', false),
('00000000-0000-4000-8000-000000000436', '00000000-0000-4000-8000-000000000234', 'D', 'Berhenti bergerak', false),
('00000000-0000-4000-8000-000000000437', '00000000-0000-4000-8000-000000000235', 'A', '30 menit lebih dahulu', false),
('00000000-0000-4000-8000-000000000438', '00000000-0000-4000-8000-000000000235', 'B', '1 jam lebih lambat', false),
('00000000-0000-4000-8000-000000000439', '00000000-0000-4000-8000-000000000235', 'C', '30 menit lebih lambat', false),
('00000000-0000-4000-8000-000000000440', '00000000-0000-4000-8000-000000000235', 'D', '1 jam lebih dahulu', true),
('00000000-0000-4000-8000-000000000441', '00000000-0000-4000-8000-000000000236', 'A', 'Meningkat di semua musim', false),
('00000000-0000-4000-8000-000000000442', '00000000-0000-4000-8000-000000000236', 'B', 'Berkurang dan risiko kekeringan naik', true),
('00000000-0000-4000-8000-000000000443', '00000000-0000-4000-8000-000000000236', 'C', 'Berubah menjadi salju', false),
('00000000-0000-4000-8000-000000000444', '00000000-0000-4000-8000-000000000236', 'D', 'Selalu tetap sama', false),
('00000000-0000-4000-8000-000000000445', '00000000-0000-4000-8000-000000000237', 'A', '1 km', false),
('00000000-0000-4000-8000-000000000446', '00000000-0000-4000-8000-000000000237', 'B', '3 km', true),
('00000000-0000-4000-8000-000000000447', '00000000-0000-4000-8000-000000000237', 'C', '5 km', false),
('00000000-0000-4000-8000-000000000448', '00000000-0000-4000-8000-000000000237', 'D', '30 km', false),
('00000000-0000-4000-8000-000000000449', '00000000-0000-4000-8000-000000000238', 'A', '200 jiwa/km²', false),
('00000000-0000-4000-8000-000000000450', '00000000-0000-4000-8000-000000000238', 'B', '600 jiwa/km²', false),
('00000000-0000-4000-8000-000000000451', '00000000-0000-4000-8000-000000000238', 'C', '2.000 jiwa/km²', true),
('00000000-0000-4000-8000-000000000452', '00000000-0000-4000-8000-000000000238', 'D', '20.000 jiwa/km²', false),
('00000000-0000-4000-8000-000000000453', '00000000-0000-4000-8000-000000000239', 'A', '25', false),
('00000000-0000-4000-8000-000000000454', '00000000-0000-4000-8000-000000000239', 'B', '50', true),
('00000000-0000-4000-8000-000000000455', '00000000-0000-4000-8000-000000000239', 'C', '75', false),
('00000000-0000-4000-8000-000000000456', '00000000-0000-4000-8000-000000000239', 'D', '100', false),
('00000000-0000-4000-8000-000000000457', '00000000-0000-4000-8000-000000000240', 'A', 'Lereng curam', true),
('00000000-0000-4000-8000-000000000458', '00000000-0000-4000-8000-000000000240', 'B', 'Lereng landai', false),
('00000000-0000-4000-8000-000000000459', '00000000-0000-4000-8000-000000000240', 'C', 'Permukaan datar', false),
('00000000-0000-4000-8000-000000000460', '00000000-0000-4000-8000-000000000240', 'D', 'Wilayah tanpa ketinggian', false),
('00000000-0000-4000-8000-000000000461', '00000000-0000-4000-8000-000000000241', 'A', '100 jiwa', false),
('00000000-0000-4000-8000-000000000462', '00000000-0000-4000-8000-000000000241', 'B', '200 jiwa', true),
('00000000-0000-4000-8000-000000000463', '00000000-0000-4000-8000-000000000241', 'C', '800 jiwa', false),
('00000000-0000-4000-8000-000000000464', '00000000-0000-4000-8000-000000000241', 'D', '1.800 jiwa', false)
ON CONFLICT (id) DO UPDATE SET
  question_id = EXCLUDED.question_id,
  option_label = EXCLUDED.option_label,
  option_text = EXCLUDED.option_text,
  is_correct = EXCLUDED.is_correct;

-- Verifikasi ringkas jumlah paket dan pertanyaan. Constraint trigger memvalidasi 4 opsi dan 1 jawaban benar saat COMMIT.
DO $$
DECLARE
  v_quiz_count integer;
  v_question_count integer;
BEGIN
  SELECT count(*) INTO v_quiz_count
  FROM public.quizzes
  WHERE id IN ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000116');
  SELECT count(*) INTO v_question_count
  FROM public.questions
  WHERE quiz_id IN ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000116');
  IF v_quiz_count <> 7 OR v_question_count <> 35 THEN
    RAISE EXCEPTION 'Question bank v2 incomplete: % packages, % questions', v_quiz_count, v_question_count;
  END IF;
END;
$$;

COMMIT;
