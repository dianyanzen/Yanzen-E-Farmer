/** Shared, deterministic fictional story proposals for residents. No private I/O. */
const kits=[
 {match:/tanam|petani|bibit|sayur|kebun|panen|bunga|pupuk/i,place:"petak kebun",problem:"satu bedengan tumbuh berbeda dari yang lain",goal:"mencari penyebabnya sebelum mengubah jadwal tanam",gesture:"Mengusap tanah di ujung jari sebelum menjawab",voice:"Tenang, memakai contoh dari musim dan tanaman",line:"Yang ini jangan dicabut dulu. Besok pagi kita lihat akarnya.",peer:"A03",traits:["teliti","sabar","keras kepala"],memory:"Pernah menunggu satu musim untuk mengetahui kesalahan kecil pada bedengan"},
 {match:/warung|pasar|pedagang|jual|toko|kuliner|masak|baker|makanan|kopi|kue/i,place:"lapak pasar",problem:"catatan pesanan tidak sesuai dengan barang yang datang",goal:"menepati janji kepada pelanggan tanpa menyalahkan pemasok",gesture:"Merapikan barang satu per satu sambil menghitung",voice:"Cepat dan ramah, tapi berhenti sebelum menyebut harga",line:"Tunggu, jumlahnya beda. Kita periksa bonnya dulu.",peer:"C08",traits:["cekatan","hangat","cermat"],memory:"Pernah mengembalikan pesanan yang salah meski lapak sedang ramai"},
 {match:/air|irigasi|drainase|saluran|sungai|lingkungan|bersih|sampah/i,place:"tepi saluran",problem:"tanda ketinggian air lama tidak cocok dengan pengukuran baru",goal:"mengajak warga memeriksa saluran sebelum hujan berikutnya",gesture:"Menunjuk garis pada tembok lalu menarik tangannya",voice:"Terukur, sering bertanya sebelum menyimpulkan",line:"Garis yang lama masih ada. Tapi siapa yang terakhir mengukurnya?",peer:"A03",traits:["waspada","sistematis","peduli"],memory:"Pernah mencatat banjir kecil yang dianggap tidak penting oleh orang lain"},
 {match:/ternak|ayam|sapi|domba|hewan|veteriner|pakan|kandang/i,place:"dekat kandang",problem:"seekor hewan berubah kebiasaan saat jam makan",goal:"mencari sebabnya tanpa membuat hewan lain gelisah",gesture:"Mendekat perlahan dan memeriksa palang kandang",voice:"Lembut dan tegas ketika membicarakan perawatan",line:"Biasanya dia yang pertama datang. Hari ini malah diam.",peer:"N01",traits:["perhatian","tekun","hati-hati"],memory:"Pernah mempelajari perilaku hewan dari kesalahan rutinitas pemberian pakan"},
 {match:/guru|sekolah|ajar|buku|perpustakaan|pendidik|murid/i,place:"ruang belajar warga",problem:"sebuah buku catatan hilang ketika kelas berpindah ruangan",goal:"menjaga anak-anak tetap belajar sambil mencari catatan itu",gesture:"Meluruskan tepi buku di meja",voice:"Jelas, memberi ruang bagi jawaban yang berbeda",line:"Kalau belum tahu jawabannya, tidak apa-apa. Mulai dari yang kamu lihat.",peer:"A02",traits:["sabar","penasaran","teratur"],memory:"Pernah membantu teman belajar dengan membuat penjelasan bergambar"},
 {match:/dokter|perawat|bidan|apot|kesehatan|klinik/i,place:"pos kesehatan",problem:"jadwal kunjungan warga berbenturan dengan kegiatan kampung",goal:"memperbaiki alur layanan tanpa mengabaikan orang yang menunggu",gesture:"Menutup buku jadwal setelah memastikan catatan lengkap",voice:"Ringkas, memastikan orang memahami informasi",line:"Boleh saya ulangi jadwalnya? Saya tidak mau ada yang tertinggal.",peer:"C13",traits:["empatik","disiplin","teliti"],memory:"Pernah belajar pentingnya mendengarkan keluhan sebelum memberi penjelasan"},
 {match:/ojek|supir|angkut|jalan|kurir|parkir|transport|sepeda/i,place:"simpang gang",problem:"jalan pintas ternyata menutup akses bagi pengangkut barang",goal:"menyusun rute yang aman dan tidak merepotkan warga",gesture:"Memeriksa arah jalan dengan ujung dagu",voice:"Lugas, sering menyebut nama gang sebagai penanda",line:"Lewat sini memang dekat, tapi coba lihat siapa yang harus mengalah.",peer:"C07",traits:["sigap","terus terang","tanggap"],memory:"Pernah memilih jalan memutar untuk membantu pengantar barang lain"},
 {match:/teknisi|mesin|bengkel|listrik|komputer|alat|montir|bangunan/i,place:"bengkel kecil",problem:"alat yang baru diperbaiki kembali macet saat dipakai",goal:"menemukan penyebab sebenarnya sebelum mengambil ongkos",gesture:"Memutar baut kecil sambil mendengarkan bunyinya",voice:"Singkat dan praktis, lebih suka menunjukkan daripada berdebat",line:"Bunyinya masih sama. Berarti tadi kita baru memperbaiki gejalanya.",peer:"A05",traits:["analitis","ulet","jujur"],memory:"Pernah membongkar alat dua kali karena tidak mau menyerahkan hasil asal jadi"},
 {match:/seni|musik|lukis|foto|penjahit|kerajinan|budaya|panggung/i,place:"sudut balai warga",problem:"hasil karya yang dibuat bersama belum punya tempat untuk dipamerkan",goal:"membuat kegiatan terbuka tanpa memaksa semua orang tampil",gesture:"Mengukur ruang kosong dengan telapak tangan",voice:"Imajinatif, memilih kata lewat hal yang terlihat",line:"Kalau kita pindah satu meja saja, sudut ini jadi tempat orang berkumpul.",peer:"A04",traits:["kreatif","peka","mandiri"],memory:"Pernah membuat acara kecil dengan peralatan pinjaman dari tetangga"},
 {match:/.*/,place:"jalan kampung",problem:"kesepakatan kerja warga terlewat saat jadwal berubah",goal:"menyelesaikan pekerjaan tanpa membebankan masalah kepada tetangga",gesture:"Memeriksa catatan sebelum memberi kepastian",voice:"Biasa dan langsung, menyimpan komentar sampai urusan pokok selesai",line:"Saya cek dulu catatannya. Jangan sampai kita salah janji.",peer:"C01",traits:["bertanggung jawab","pengamat","teguh"],memory:"Pernah mengubah rencana setelah mendengar keberatan tetangga"}
];
const beats=[
 ["Menemukan satu hal yang tidak sesuai rencana","Meminta keterangan dari orang yang ikut terdampak","Menyusun kesepakatan yang bisa dijalankan bersama"],
 ["Memeriksa pekerjaan yang belum selesai","Menyadari persoalan lebih besar daripada yang tampak","Memilih perbaikan kecil yang bisa dipertanggungjawabkan"],
 ["Mendengar kabar dari dua sudut kampung","Mengecek bukti sebelum mengambil keputusan","Mengajak pihak yang berbeda menyelesaikannya"]
];
const active=new Set(["A03","A04","C01","C07","C08"]);
function pathFor(portrait){
 const group=/^R\d{3}$/.test(portrait)?"residents":/^K\d{2}$/.test(portrait)?"neighborhood":
  /^N\d{2}$/.test(portrait)?"specialists":/^P\d{2}$/.test(portrait)?"civic":
  /^phone-/.test(portrait)?"phone":"professions";
 return "/game/assets/portraits/bandung/"+group+"/"+portrait+".png";
}
export function draftResidentBible(row,revision=false){
 const kit=kits.find(k=>k.match.test(row.occupation))??kits[kits.length-1];
 const n=Number(row.id.match(/\d+/)?.[0]??1);
 const [begin,middle,end]=beats[n%beats.length];
 const scene=kit.place;
 const work=row.occupation.toLowerCase();
 return {
  id:row.id,characterClass:revision?"docker-identity-revision":"resident-expansion-concept",
  approval:"draft-fictional-needs-human-review",
  sourceFacts:["Published Docker-derived NPC roster: ID, displayed name, occupation and portrait only"],
  proposedFields:["age","physical details","personal history","relationships","psychology","dialogue","story arc"],
  sections:{
   "01_core_identity":{name:row.name,ageYears:null,origin:"Kota Bandung dalam dunia fiksi; asal lebih rinci belum ditetapkan",language:"Bahasa Indonesia, ragam lokal ditentukan oleh adegan",identity:"Warga YZ Farm Life; identitas dan pekerjaan mengikuti roster Docker"},
   "02_physical_appearance":{general:"Rancangan gerak: "+kit.gesture+". Ciri wajah belum dinilai dari ilustrasi.",visualDirection:"Periksa potret "+row.portrait+" sebelum menentukan warna rambut, bentuk tubuh atau usia visual.",verification:"Usulan, bukan deskripsi fisik terverifikasi"},
   "03_fashion_aesthetic":{signatureClothing:"Busana kegiatan "+work+"; bentuk, palet, dan aksesori harus mengikuti potret yang ditinjau.",clothing:"Utamakan siluet yang terbaca dalam sprite kecil dan tidak berubah antar-ekspresi.",productionStatus:"Konsep perlu QA visual"},
   "04_social_profile":{occupation:row.occupation,communityActivity:"Kegiatan kerja terhubung dengan "+scene+".",storyRole:"Penghubung antara rutinitas "+work+" dan kebutuhan tetangga; belum dijadwalkan di peta."},
   "05_personality":{traits:kit.traits,observableHabit:kit.gesture,values:"Menjaga hasil kerja sambil menghormati keputusan orang lain",flaw:"Terlalu lama memeriksa hal kecil ketika situasi sedang mendesak"},
   "06_psychological_profile":{motivation:"Berusaha "+kit.goal,innerConflict:"Di "+scene+", "+kit.problem+". Ia belum yakin cara memperbaikinya akan diterima semua pihak.",fear:"Usahanya justru mempersulit orang yang mengandalkan pekerjaannya",stressResponse:"Kembali memeriksa hal yang sudah dilakukan sebelum meminta bantuan"},
   "07_background_history":{familyContext:"Belum ditulis; keluarga dan data pribadi tidak disimpulkan dari nama atau potret.",formativeMemory:kit.memory,sourceStatus:"Kenangan merupakan usulan cerita fiktif, bukan biografi warga"},
   "08_relationship_dynamics":{connections:[{characterId:kit.peer,description:"Rencana pertemuan terkait pekerjaan di "+scene,planned:true}],trustBuildsThrough:"Menepati janji kecil dan mendengarkan jawaban tanpa memaksa",personalBoundary:"Tidak mengungkap asal, alamat, atau kehidupan pribadi sebelum ditulis sebagai fiksi dan disetujui"},
   "09_dialogue_behavior":{speechPattern:kit.voice,physicalCue:kit.gesture,sampleLine:kit.line,stressVoice:"Kalimat memendek saat persoalan belum jelas"},
   "10_narrative_development":{arcTitle:"Urusan kecil di "+scene,establishedPremise:"Di "+scene+", "+kit.problem+".",personalGoal:kit.goal,threeActBeats:[begin,middle,end],implementation:"Rancangan fiksi; quest belum aktif dan tidak boleh mengubah save secara otomatis"},
   "11_visual_references":{conceptPortrait:pathFor(row.portrait),styleGroup:"bandung-concept-illustration-v1",visualApproval:"pending-human-review",visualContinuity:"Aset potret "+row.portrait+" merupakan referensi, bukan expression sheet siap dialog"},
   "12_continuity_current_state":{availability:active.has(row.id)?"ID ini sudah memiliki penempatan NPC di prototype; identitas barunya perlu audit dialog":"Belum ditempatkan sebagai NPC aktif di peta",relationshipSaveState:"Gunakan game save untuk status hubungan; jangan membuat progress dari dokumen.",sourceIdentity:row.id+" · "+row.name+" · "+row.occupation,doNotContradict:"Jangan menganggap adegan dan keluarga usulan sudah terjadi dalam game"}
  }
 };
}
export function makePublishedResidentBibles(roster,known){
 if(!Array.isArray(roster)||roster.length>500)throw new Error("Roster must be an array of at most 500");
 const result={},names=new Set();
 for(const row of roster){
  if(!row||typeof row!=="object"||Object.keys(row).sort().join(",")!=="id,name,occupation,portrait")throw new Error("Unexpected resident fields");
  if(typeof row.id!=="string"||!/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/.test(row.id)||row.id==="A01")throw new Error("Invalid resident ID");
  if([row.name,row.occupation,row.portrait].some(v=>typeof v!=="string"||!v.trim()))throw new Error("Incomplete public resident");
  if(names.has(row.name.toLocaleLowerCase("id"))||Object.hasOwn(result,row.id))throw new Error("Duplicate resident");
  names.add(row.name.toLocaleLowerCase("id"));
  const original=known.get(row.id);
  const unchanged=original&&original.name===row.name&&original.occupation===row.occupation;
  if(row.id.startsWith("P")&&!unchanged)throw new Error("Public figure cameo requires separately approved canon");
  if(unchanged)continue;
  result[row.id]=draftResidentBible(row,Boolean(original));
 }
 return result;
}
