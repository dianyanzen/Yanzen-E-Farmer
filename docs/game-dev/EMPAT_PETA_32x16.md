# Empat peta luar · 21 November 2026

Ukuran area bermain berubah dari 24 × 16 menjadi 32 × 16 tile, 20 piksel per tile. Delapan kolom baru berada di timur setiap lokasi. Koridor lama, posisi pintu, NPC, dan 48 petak tanam dipertahankan. Atlas perjalanan lama tetap menjadi indeks koneksi antarlokasi. Untuk mencapai area baru, ambil jalan timur di baris 12 atau 13 (indeks mulai nol), di selatan jalur utama.

Semua lokasi luar kini memakai kamera Phaser yang sama, mengikuti pemain dengan proyeksi 2D dari atas. Kamera kebun sebelumnya menampilkan seluruh kebun dengan hutan dekoratif di kedua sisi. Pada layar lebar batas kamera kini mengikuti area bermain.

## Susunan visual

Referensi memakai kelompok objek untuk menjelaskan fungsi tiap tempat. Teras dan kanal membingkai kebun, jemuran menandai halaman rumah, peti sayur mengelilingi pasar, sedangkan bambu dan batu membingkai aliran air. Pada tahap ini jalan samping dan vegetasi baru ditempatkan di keempat lokasi. Tajuk dan pakis menyusun lapisan di utara, dengan pot dan bunga di gang, barang dagangan di pasar serta talud di sungai. Objek lingkungan memakai kedalaman sesuai posisi kaki. Lahan budidaya tetap digambar per petak mengikuti progres.

## Verifikasi

Uji regresi game memeriksa rute klik dan jalan kaki sampai kolom 30, simpan/muat di area baru, serta batas timur setiap lokasi. Empat peta dan dua interior dirender dengan Chromium. Gambar berikut diambil dengan kamera mengarah ke perluasan timur.

[Kebun](../../game-assets/generated/terrain/review-32-field.png) · [Gang](../../game-assets/generated/terrain/review-32-gang.png) · [Pasar](../../game-assets/generated/terrain/review-32-pasar.png) · [Sungai](../../game-assets/generated/terrain/review-32-sungai.png)

Tahap ini memperluas tapak peta dan menambah komposisi objek. Detail fasad rumah, bentuk tepian sungai, serta variasi komoditas seperti pada referensi masih menjadi pekerjaan visual berikutnya.
