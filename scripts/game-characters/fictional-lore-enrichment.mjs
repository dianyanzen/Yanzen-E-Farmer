/**
 * Editor-only generator for fictional NPC lore. No birthplaces, family IDs, real
 * biographies, gameplay flags, or portrait-derived personal claims.
 * Only mutate the 246 non-cameo canonical fictional dossiers that have empty fields.
 */
const regions = {
  farm: [
    ['Ciwidey','kebun yang sering berkabut','membaca perubahan musim sebelum memutuskan'],
    ['Banjaran','pekarangan dekat lahan garapan','memeriksa pekerjaan kecil lebih dulu'],
    ['Pangalengan','lereng perkebunan','mencatat hasil percobaan sebelum memberi saran'],
    ['Soreang','jalan kampung di dekat lahan tanam','mendengar pengalaman petani lain'],
    ['Cimenyan','kebun bertingkat','mempertimbangkan akibat setiap perubahan'],
    ['Baleendah','kegiatan bertani warga','menghargai kerja sama dan kesabaran']
  ],
  craft: [
    ['Majalaya','ruang kerja kerajinan rumahan','menghargai waktu untuk membuat karya'],
    ['Cibaduyut','deretan bengkel dan toko','memeriksa hasil sebelum menyebutnya selesai'],
    ['Ujungberung','kegiatan seni dan kerajinan warga','menggunakan kembali bahan yang masih baik'],
    ['Cicadas','lorong kios dan meja kerja','memahami nilai sebuah pekerjaan dari dekat'],
    ['Kiaracondong','usaha rumahan di tengah permukiman','menyelaraskan cara kerja yang berbeda'],
    ['Arcamanik','ruang komunitas yang dipakai bersama','mencatat hal kecil yang bisa diperbaiki']
  ],
  market: [
    ['Regol','warung yang sibuk sejak pagi','mengingat kebiasaan pelanggan tanpa mencampuri urusannya'],
    ['Andir','lapak-lapak pasar','membedakan janji dan bantuan yang benar-benar datang'],
    ['Babakan Ciparay','jalur pemasok ke kios kecil','menyusun urutan pesanan dengan teliti'],
    ['Buahbatu','pertokoan dekat rumah warga','berbicara jelas tentang harga dan mutu'],
    ['Gedebage','jalan angkut dan gudang','menghargai waktu serta keselamatan orang'],
    ['Cicendo','pertemuan banyak jalur kerja','mendengar dua sisi sebelum memberi jawaban']
  ],
  art: [
    ['Ujungberung','latihan kesenian kampung','menghargai orang yang bekerja di balik layar'],
    ['Cibiru','kegiatan seni komunitas','memberi orang kesempatan untuk belajar'],
    ['Lengkong','panggung kecil warga','membagi ruang dan giliran dengan adil'],
    ['Coblong','kedai dan diskusi kreatif','mendengarkan cerita tanpa segera mengubahnya'],
    ['Cicadas','suara jalanan dan musik sore','menemukan irama dalam keseharian'],
    ['Sukajadi','pertemuan kelompok kreatif','menanggapi selera yang berbeda']
  ],
  tech: [
    ['Kiaracondong','bengkel dan persimpangan ramai','mencari penyebab sebelum mengganti alat'],
    ['Gedebage','gudang dan jalur distribusi','mencatat detail saat pergantian tugas'],
    ['Antapani','usaha reparasi rumahan','mencari solusi yang dapat dirawat'],
    ['Cicendo','rute transportasi yang berpotongan','mengutamakan keselamatan dari kecepatan'],
    ['Cibeunying Kidul','ruang belajar dan toko perbaikan','bertanya sebelum membongkar sesuatu'],
    ['Batununggal','rumah-rumah dekat bengkel','menjelaskan persoalan tanpa menyalahkan']
  ],
  civic: [
    ['Bojongsoang','pertemuan warga dan gotong royong','mendengar orang yang jarang bicara'],
    ['Baleendah','kegiatan bersama warga','berbagi tugas agar tidak menumpuk'],
    ['Cibiru','ruang belajar komunitas','memberi kesempatan mencoba'],
    ['Mandalajati','forum warga dan perpustakaan kecil','merapikan informasi sebelum dibagikan'],
    ['Cicalengka','kegiatan yang dibantu relawan','meminta persetujuan sebelum bertindak'],
    ['Soreang','pertemuan lingkungan','membedakan kabar dengan hasil pemeriksaan']
  ],
  general: [
    ['Pasirluyu','gang di tepi kebun','menghargai percakapan setelah pekerjaan'],
    ['Regol','rumah dan kedai yang ramai','mengenal tetangga tanpa mengusik privasi'],
    ['Buahbatu','jalan permukiman dan kios musiman','membagi waktu dengan cermat'],
    ['Cibiru','gang yang hidup menjelang sore','mempertimbangkan keberatan dengan tenang'],
    ['Cimenyan','jalan menanjak dan kebun kecil','melihat masalah dari beberapa sisi'],
    ['Antapani','beranda tempat warga mengobrol','memilah nasihat yang benar-benar berguna']
  ]
};
function domain(o){
 const x=o.toLowerCase();
 if(/kebun|tani|padi|benih|bibit|panen|bunga|kompos|pembibitan|irigasi|unggas|lebah|ikan|satwa|burung|persemaian|organik|ternak|sawah|kolam|pohon/.test(x)) return 'farm';
 if(/perawat|dokter|apoteker|posyandu|pengajar|guru|kader|perpustakaan|pustakawan|konselor|klinik|pemadam|satpam|ronda|keselamatan|kebersihan|bank sampah|penyuluh/.test(x)) return 'civic';
 if(/teknisi|mekanik|montir|listrik|sistem|mesin|komputer|peralatan|kamera|jam mekanis|ledeng|peta|peneliti|pengamat air/.test(x)) return 'tech';
 if(/perajin|penenun|tenun|batik|sulam|kain|busana|kostum|jahit|aksesoris|aksesori|sepatu|kayu|furnitur|topeng|kerajinan|batu|bambu|pewarna/.test(x)) return 'craft';
 if(/pasar|kios|toko|warung|pedagang|penjual|roti|katering|jajanan|kopi|teh|soto|tahu|makanan|minuman|sambal|kantin|kurir|pengantar|porter|angkut|kasir|teller|paket/.test(x)) return 'market';
 if(/seni|musik|pemain|penari|tari|peraga|suling|radio|cerita|fotografer|panggung|proyektor|audio|ilustrator|pentas|benjang|kecapi|angklung|pertunjukan|podcast/.test(x)) return 'art';
 if(/kebun|petani|padi|benih|bibit|tanam|tani|panen|bunga|kompos|pembibitan|irigasi|unggas|lebah|ikan|satwa|burung|persemaian|organik|ternak|sawah|kolam|hijau|pohon/.test(x)) return 'farm';
 return 'general';
}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const origins=[
 (n,p,s,h)=>`${n} lama tinggal di sekitar ${p}, tempat ${s} menjadi pemandangan akrab. Dari sana ia belajar ${h} dan membawa kebiasaan itu ke lingkungan Pasirluyu.`,
 (n,p,s,h)=>`Sebelum dikenal warga Pasirluyu, ${n} menghabiskan banyak waktu di ${p}. Di tengah ${s}, ia terbiasa ${h}; tak semua cara lama itu cocok di tempat yang baru.`,
 (n,p,s,h)=>`Jejak awal ${n} dalam cerita ini berangkat dari ${p}, di antara ${s}. Ia mulai terbiasa ${h}, sesuatu yang kelak memengaruhi cara bekerja dan bergaulnya.`,
 (n,p,s,h)=>`${p} adalah lingkungan asal ${n} dalam kisah ini. Suasana ${s} membuatnya belajar ${h}, meski kini ia tidak selalu setuju dengan cara yang dahulu dianggap biasa.`,
 (n,p,s,h)=>`${n} lebih mudah mengingat ${p} dari suasana ${s} daripada satu peristiwa besar. Di sanalah ia belajar ${h}, lalu mencoba menerapkannya di dekat kebun Pasirluyu.`,
 (n,p,s,h)=>`Cerita ${n} bermula di ${p}, dekat ${s}. Ia terbiasa ${h}; kebiasaan ini sering membantu, tetapi terkadang membuat keputusan sederhana terasa panjang.`,
 (n,p,s,h)=>`Sebelum menetap dalam lingkungan cerita Pasirluyu, ${n} mengenal keseharian ${p}. Pengalaman dengan ${s} mengajarkannya ${h}.`,
 (n,p,s,h)=>`Dalam versi cerita ini, ${n} berasal dari lingkungan ${p} dengan ${s}. Ia membawa kebiasaan ${h} saat mulai membangun hubungan dengan tetangga baru.`
];
const families=[
 (n,o)=>`Di rumah, ${n} sering membantu seorang adik mengatur kegiatan harian. Keluarga menghargai pekerjaannya sebagai ${o}, tetapi ingin ia lebih sering memberi waktu untuk dirinya sendiri.`,
 (n,o)=>`${n} tinggal sendiri, namun makan bersama keluarga bibinya setiap akhir pekan sudah menjadi kebiasaan. Di sana ia tak perlu terus membicarakan pekerjaan ${o}.`,
 (n,o)=>`Sebagai anak sulung, ${n} sering dimintai pendapat dalam urusan rumah. Ia belajar bahwa pengalaman sebagai ${o} tidak menjadikannya paling tahu semua persoalan.`,
 (n,o)=>`${n} dan seorang sepupu bergantian mengurus rumah keluarga. Mereka akrab, walaupun perbedaan cara bekerja sesekali menjadi bahan perdebatan sepulang dari tugas ${o}.`,
 (n,o)=>`Ayah ${n} cenderung percaya pengalaman lama, sedangkan ${n} ingin membandingkan beberapa pilihan. Mereka kadang berbeda pendapat soal pekerjaan ${o}, tetapi tetap saling membantu.`,
 (n,o)=>`Keluarga ${n} tinggal di beberapa tempat dan berusaha berkumpul saat libur. Kesibukan sebagai ${o} membuatnya belajar memberi kabar tanpa membuat janji berlebihan.`,
 (n,o)=>`Di rumah, ${n} sering merapikan catatan kebutuhan bersama. Keluarga sesekali mengingatkan agar persoalan pekerjaan ${o} tidak dibawa terus ke meja makan.`,
 (n,o)=>`Ibunya suka mendengar cerita ${n} selepas bekerja. Tidak semua masalah ${o} dapat diselesaikan saat itu, tetapi percakapan membuatnya pulang dengan pikiran lebih tenang.`,
 (n,o)=>`${n} dekat dengan kakak yang pekerjaannya berbeda jauh. Keduanya sering bertukar cerita tanpa berlomba membuktikan siapa yang paling lelah.`,
 (n,o)=>`Seorang paman mengajarkan ${n} memperbaiki barang sebelum membuangnya. Kebiasaan itu kadang berguna saat bekerja sebagai ${o}, namun harus ditinggalkan bila keselamatan dipertaruhkan.`,
 (n,o)=>`Saat keluarga berkumpul, ${n} lebih suka membantu menyiapkan makanan daripada menjadi pusat percakapan. Mereka tahu ia bisa keras kepala jika membahas pekerjaan ${o}.`,
 (n,o)=>`${n} dan saudaranya menyisihkan uang untuk memperbaiki rumah keluarga secara bertahap. Mereka berusaha menjaga agar pekerjaan ${o} tidak menghabiskan seluruh waktu bersama.`,
 (n,o)=>`Karena jadwal keluarga berbeda, secarik pesan di dekat pintu sering menggantikan obrolan panjang. ${n} jadi terbiasa memberi kabar jika tugas ${o} berubah mendadak.`,
 (n,o)=>`Nenek ${n} gemar menyimpan benda kecil beserta kisahnya. ${n} menghargai cerita itu, namun ingin menentukan sendiri apa yang perlu dibawa ke pekerjaannya sebagai ${o}.`,
 (n,o)=>`Keluarga ${n} biasa menawarkan bantuan tanpa menunggu diminta. Ia ingin sikap yang sama hadir dalam pekerjaan ${o}, sambil tetap menghormati batas orang lain.`,
 (n,o)=>`Adik ${n} senang bertanya tentang tempat kerjanya. Pertanyaan yang tampak sederhana itu kadang membuat ${n} memeriksa kembali keputusan sebagai ${o}.`,
 (n,o)=>`${n} dan bibinya sama-sama teguh bila membahas keselamatan keluarga. Mereka biasanya kembali akur setelah menjelaskan alasan masing-masing, bukan sekadar saling mengalah.`,
 (n,o)=>`Seorang kerabat berharap ${n} memilih pekerjaan yang dianggap lebih pasti. ${n} tidak ingin menjauh; ia berharap pekerjaannya sebagai ${o} dapat dipahami lewat hasil nyata.`,
 (n,o)=>`Dalam keluarga ${n}, tidak semua persoalan harus langsung dibicarakan. Ia menghormati ruang pribadi orang lain, tetapi sadar diam terlalu lama juga bisa menimbulkan salah paham.`,
 (n,o)=>`Anggota keluarga ${n} sering saling mengantarkan masakan saat ada yang sibuk. Bantuan kecil itu membentuk cara pandangnya tentang pekerjaan ${o} yang berguna tanpa menuntut balasan.`,
 (n,o)=>`${n} dan sepupunya memiliki minat berbeda. Mereka tetap bertemu pada akhir pekan, saling menanyakan hal yang sedang sulit tanpa merasa wajib memberi solusi.`,
 (n,o)=>`Dalam pertemuan keluarga, ${n} sering diminta mencatat kebutuhan bersama. Ia ingin belajar membagi tugas, sebab pekerjaan ${o} juga memerlukan waktu yang tidak sedikit.`,
 (n,o)=>`${n} pernah berjanji lebih sering pulang sebelum malam untuk bercakap dengan keluarga. Sejak bekerja sebagai ${o}, ia memilih kesepakatan yang lebih realistis.`,
 (n,o)=>`Keluarga ${n} senang mendiskusikan rencana bersama, walau tak selalu sepakat kapan mengambil risiko. Perbedaan itu mengajarinya bahwa pekerjaan ${o} juga memerlukan kompromi.`
];
export function enrichLore(doc){
 if(['P01','P02'].includes(doc.id))return doc;
 const c=doc.sections['01_core_identity'],h=doc.sections['07_background_history'];
 if(c.origin!==null||h.familyContext!==null)throw new Error('Expected empty origin/family for '+doc.id);
 if(doc.approval!=='draft')throw new Error('Unexpected approval for '+doc.id);
 const k=hash(doc.id),[place,scene,lesson]=regions[domain(doc.occupation)][k%regions[domain(doc.occupation)].length];
 const nick=c.preferredName||doc.name.split(' ')[0];
 c.origin=origins[(k>>>4)%origins.length](nick,place,scene,lesson)+' (latar fiksi; draf)';
 h.familyContext=families[(k>>>8)%families.length](nick,doc.occupation.toLocaleLowerCase('id-ID'))+' (latar fiksi; draf)';
 doc.fieldProvenance['01_core_identity.origin']={source:'fictional-worldbuilding-editorial-draft',confidence:0.48,claimType:'fictional-worldbuilding-proposal',requiresReview:true};
 doc.fieldProvenance['07_background_history.familyContext']={source:'fictional-worldbuilding-editorial-draft',confidence:0.40,claimType:'fictional-worldbuilding-proposal',requiresReview:true};
 return doc;
}
const H={
 '01_core_identity':'Identitas','02_physical_appearance':'Penampilan dan bahasa tubuh',
 '03_fashion_aesthetic':'Busana dan estetika','04_social_profile':'Pekerjaan dan kehidupan sosial',
 '05_personality':'Kepribadian fiksi','06_psychological_profile':'Motivasi dan konflik fiksi',
 '07_background_history':'Latar cerita','08_relationship_dynamics':'Interaksi dan hubungan',
 '09_dialogue_behavior':'Suara dan dialog','10_narrative_development':'Perkembangan cerita',
 '11_visual_references':'Referensi visual','12_continuity_current_state':'Kontinuitas dan status runtime'
};
function value(v){
 if(v===null||v===undefined)return 'Belum ditetapkan';
 if(typeof v==='boolean')return v?'Ya':'Tidak';
 if(typeof v==='string')return v;
 if(Array.isArray(v))return v.length?v.map(t=>'- '+value(t)).join('\n'):'Belum ditetapkan';
 if(typeof v==='object')return Object.entries(v).length?Object.entries(v).map(([k,x])=>'- **'+k+':** '+value(x)).join('\n'):'Belum ditetapkan';
 return String(v);
}
export function renderPublicWiki(r){
 const ignored=new Set(['name','fullName','canonicalId','occupation','portraitKey','conceptPortrait']);
 const lines=['# '+r.name+' ('+r.id+')','','**Peran:** '+r.occupation,
  '**Potret:** ![Potret '+r.id+'](../../../public'+r.portraitUrl+')',
  '**Status:** Rancangan fiksi publik — belum disahkan sebagai kisah atau gameplay aktif.','',
  '> Seluruh cerita dan sifat di halaman ini adalah konsep untuk tokoh fiksi YZ Farm Life, bukan biografi seseorang di dunia nyata.',''];
 for(const [key,title]of Object.entries(H)){
  lines.push('## '+title,'');
  for(const [field,v]of Object.entries(r.sections[key])){
   if(ignored.has(field)||v===null)continue;
   const label=field.replaceAll('_',' ');
   if(Array.isArray(v)||typeof v==='object'){
    if(v.length===0||Object.keys(v).length===0)continue;
    lines.push('**'+label+'**',value(v),'');
   }else lines.push('**'+label+':** '+value(v),'');
  }
  if(key==='06_psychological_profile'&&['P01','P02'].includes(r.id))
   lines.push('Tidak ada atribusi psikologi, motivasi, atau riwayat pribadi untuk kameo tokoh publik.','');
 }
 if(Array.isArray(r.publicBiography?.sources)&&r.publicBiography.sources.length){
  lines.push('## Sumber biografi publik','','Rujukan hanya untuk fakta profil kameo; dialog serta kejadian di dalam game sepenuhnya fiksi.','');
  for(const source of r.publicBiography.sources){
   if(typeof source.title==='string'&&typeof source.url==='string'&&source.url.startsWith('https://'))lines.push('- ['+source.title+']('+source.url+')');
  }
  lines.push('');
 }
 lines.push('---','Karakter ini merupakan bagian dari katalog fiksi YZ Farm Life. Data identitas canonical dikunci; pengesahan lore dan implementasi gameplay dilakukan terpisah.','');
 return lines.join('\n');
}
