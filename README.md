# 🍕 QA POS Resto — Dokumentasi Resmi Sistem POS Kasir & Analitik

Selamat datang di dokumentasi resmi **QA POS Resto**, sebuah aplikasi *Point of Sale* (POS) modern berbasis cloud yang dirancang khusus untuk operasional restoran, manajemen shift kasir, dan analitik bisnis tingkat lanjut secara real-time.

Aplikasi ini menggabungkan arsitektur *offline-first* dengan sinkronisasi database relasional (Google Cloud SQL PostgreSQL) guna memastikan kasir tetap dapat melayani pelanggan di lapangan sekalipun koneksi internet terganggu.

---

## 🚀 Fitur Utama & Alur Kerja Sistem

### 1. Manajemen Multi-Akses (Role-Based Access)
Sistem memiliki pengenalan otorisasi ganda untuk menjaga keamanan terminal laci kasir:
*   **Kasir (Cashier):** Memiliki akses langsung ke terminal pemesanan hidangan (*Order Terminal*) dan laporan penutupan shift per hari.
*   **Admin Utama (Administrator):** Memiliki akses penuh ke laporan penjualan tahunan, analitik laba-rugi, penyesuaian stok bahan baku, voucher promo, pengaturan cetak struk, dan penyesuaian otorisasi pengguna.
*   **Sandi PIN Otorisasi:** Sistem menerapkan kunci sandi PIN terenkripsi. Sesi audit sensitif seperti pembatalan (*void*) pesanan oleh kasir memerlukan otorisasi sandi PIN Admin secara langsung di tempat.

---

### 💳 2. Terminal Pemesanan Premium (Desain Baru & Efisien)
Antarmuka menu pemesanan kasir dirancang dengan tata letak minimalis premium yang terinspirasi dari aplikasi kuliner kelas atas (seperti Pizza Hut) dengan performa visual super-responsif:
*   **Palet Warna Ivory Hangat (`bg-[#FAF6F0]`):** Menggantikan tema abu-abu dingin dengan nuansa krem yang ramah di mata kasir untuk durasi kerja yang panjang.
*   **Kapsul Kategori Melingkar:** Tombol filter menu berwujud kapsul estetik bulat dengan highlight merah tebal (`bg-[#E51B24]`) saat terpilih.
*   **Kartu Produk "Popular Picks":**
    *   **Pita Lencana:** Menampilkan tag dinamis `BESTSELLER`, `POPULAR`, atau `NEW` di pojok kiri atas produk.
    *   **Suka Interaktif:** Dilengkapi tombol ikon hati (`Heart`) interaktif di tiap kartu produk.
    *   **Bintang Kepuasan:** Menampilkan rating kepuasan (misal: `⭐ 4.8 (1.2k+)`) untuk referensi kasir saat memberikan rekomendasi rasa kepada pembeli.
    *   **Aksi Cepat:** Tombol tambah pesanan melingkar merah tebal untuk mempercepat proses input nota.
*   **Tata Letak Ringkas & Fokus:** Atas permintaan pemilik, sistem menyembunyikan banner dekoratif besar (banner promo, hero, sapaan) sehingga katalog menu langsung naik ke atas untuk efisiensi ruang pandang maksimum di komputer tablet kasir.

---

### 💳 3. Alur Input Referensi Pembayaran Non-Tunai (Wajib)
Untuk meminimalisir kesalahan pembukuan dan mempermudah proses rekonsiliasi (*pencocokan rekening koran*), sistem mewajibkan pencatatan nomor transaksi/nomor kartu pada transaksi non-tunai:
*   **Penerapan:** Berlaku untuk metode pembayaran **Debit, QRIS, dan Kredit**.
*   **Validasi Keamanan:** Kolom input **ID Transaksi / Ref QRIS** atau **No. Kartu / No. Transaksi** wajib diisi oleh kasir. Tombol **"BAYAR"** akan otomatis terkunci (*disabled*) jika input ini kosong.
*   **Integrasi Struk Thermal:** Referensi nomor transaksi ini disimpan dalam properti data order (`referenceNumber`) dan dicetak secara nyata pada lembar struk fisik pelanggan (`ThermalReceipt.tsx`).

---

### 📊 4. Dashboard Keuangan Admin (Visual Summary Cards Hari Ini)
Admin yang masuk ke dashboard akan disajikan dengan kartu ringkasan kinerja harian yang dihiasi dengan komponen grafik mikro (*sparkline*) interaktif berbasis **Recharts**:
*   **Total Pendapatan Hari Ini:** Menampilkan akumulasi nilai omset rupiah bersih hari ini, dipadukan dengan grafik batang tren pendapatan 5 hari terakhir sesi berjalan.
*   **Jumlah Pesanan Berhasil:** Menampilkan total nota belanja sukses hari ini lengkap dengan grafik batang tren transaksi untuk memantau waktu-waktu padat pelanggan.
*   **Menu Terlaris Hari Ini:** Menampilkan nama menu makanan atau minuman paling laku hari ini, dipadukan dengan grafik horizontal persentase penjualan dari **Top 3 Menu Terlaris Hari Ini**.

---

### 📥 5. Alur Data Laporan Shift & Penutupan Laci Kasir
Saat kasir mengetuk tombol **"Kirim Laporan & Selesaikan Shift"** di tab Sales Report, sistem memproses data sebagai berikut:

#### **A. Kemanakah Data Terkirim?**
1.  **Penyimpanan Lokal Browser (`localStorage`):**
    *   Data langsung ditulis secara permanen ke memori peramban lokal di bawah kunci (**Key**) khusus: `qapos_shift_reports`.
    *   Mencegah kehilangan data laporan akibat mati listrik, halaman web dimuat ulang (*refresh*), atau peramban ditutup paksa.
2.  **Panel Riwayat Audit Sisi Klien:**
    *   Data laporan ditransfer ke state React `reportedLogs` untuk langsung dimunculkan di bagian paling bawah halaman pada panel **"Riwayat Laporan Shift Terkirim"**.
    *   Supervisor atau admin restoran dapat langsung melakukan audit fisik, mencocokkan nominal selisih kas, melihat catatan khusus kasir, serta memantau rincian metode pembayaran non-tunai langsung di layar.

#### **B. Mengapa Menggunakan Alur Ini?**
*   **Kepatuhan Audit Laci Kasir:** Rekonsiliasi kas mengunci performa fisik pada terminal fisik itu sendiri (*cash drawer level security*).
*   **Kerahasiaan Data Mentah:** Menghindari pengiriman nominal selisih uang kasir mentah secara bebas ke internet publik tanpa tanda tangan ganda dari supervisor toko melalui cetak dokumen PDF formal laporan bulanan.

---

## 🛠️ Panduan Teknis & Struktur Folder

Aplikasi POS ini menggunakan kerangka kerja full-stack modern dengan struktur file sebagai berikut:

*   `/src/types.ts` — Berisi definisi kontrak data TypeScript untuk `Order`, `Product`, `Customer`, `Promo`, dan `User` (termasuk properti baru `referenceNumber`).
*   `/src/components/OrderTerminal.tsx` — Terminal utama kasir. Berisi modul keranjang belanja, integrasi voucher promo, tombol suka produk, form wajib referensi pembayaran non-tunai, dan pembersihan keranjang.
*   `/src/components/SalesReport.tsx` — Modul kalkulasi harian, visual summary cards harian berbasis Recharts, serta form tutup shift laporan kasir.
*   `/src/components/ThermalReceipt.tsx` — Desain struk belanja kasir berukuran kertas 80mm/58mm yang menampilkan metode bayar beserta nomor referensi non-tunai.
*   `server.ts` — Backend Express yang terhubung dengan Google Cloud SQL (PostgreSQL).

### Perintah Penting (Development):
*   `npm run build` — Melakukan kompilasi produksi aplikasi.
*   `npm run lint` — Memvalidasi standardisasi penulisan kode dan tipe TypeScript agar bebas dari kesalahan fatal.
