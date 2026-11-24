/** Public fictional character encyclopedia metadata. Never gates access on GameState. */
export const WARGAPEDIA_CATEGORIES:ReadonlyArray<[string,string]>=[
 ['01_core_identity','Identitas'],['02_physical_appearance','Penampilan'],
 ['03_fashion_aesthetic','Busana'],['04_social_profile','Pekerjaan dan kegiatan'],
 ['05_personality','Kepribadian fiksi'],['06_psychological_profile','Motivasi dan konflik fiksi'],
 ['07_background_history','Latar cerita'],['08_relationship_dynamics','Hubungan dan batas pribadi'],
 ['09_dialogue_behavior','Cara bicara dan ekspresi'],['10_narrative_development','Perkembangan cerita'],
 ['11_visual_references','Referensi visual'],['12_continuity_current_state','Kontinuitas dan status']
];
export const WARGAPEDIA_FIELD_LABELS:Record<string,string>={
 name:'Nama',fullName:'Nama lengkap',preferredName:'Nama panggilan',ageYears:'Usia',origin:'Asal',language:'Bahasa',identity:'Identitas',
 general:'Gambaran',physicalTraits:'Ciri fisik',bodyLanguageDirection:'Bahasa tubuh',proposedPose:'Konsep pose',
 signatureClothing:'Pakaian khas',palette:'Palet warna',aesthetic:'Nuansa visual',costumeConcept:'Konsep kostum',
 occupation:'Pekerjaan',communityActivity:'Kegiatan warga',hobbies:'Kegemaran',functionInWorld:'Fungsi di dunia',
 workRoutineConcept:'Rancangan rutinitas',workplaceConcept:'Rancangan lingkungan kerja',
 traits:'Sifat fiksi',observableHabit:'Kebiasaan',values:'Nilai yang dijaga',weakness:'Kelemahan',
 strengthConcept:'Potensi kelebihan',flawConcept:'Konsep kekurangan',microHabitConcept:'Gerak kecil',
 primaryMotivation:'Motivasi tokoh',need:'Kebutuhan',innerConflict:'Konflik batin',fear:'Ketakutan dalam cerita',
 motivationConcept:'Rancangan motivasi',conflictConcept:'Rancangan konflik',agencyConcept:'Pilihan mandiri NPC',
 narrativeBackground:'Premis kisah',sceneConcept:'Latar adegan',narrativeStatus:'Status naskah',
 relationshipHook:'Jalinan relasi',trustBehavior:'Cara membangun kepercayaan',personalBoundary:'Batas pribadi',
 boundaryConcept:'Rancangan batas interaksi',connections:'Relasi terkonfirmasi',
 speechSignature:'Gaya bicara',sampleLine:'Contoh percakapan',habitualGesture:'Gestur',reactions:'Reaksi',
 dialogueDrafts:'Alternatif dialog',speakingCadence:'Ritme bicara',publicCameoGuardrail:'Batasan kameo',
 storyArc:'Alur cerita',questHook:'Ide misi',threeActBeats:'Tiga tahap cerita',playerChoices:'Pilihan pemain',
 implementation:'Status implementasi',sideQuestConcept:'Rancangan misi sampingan',choiceConsequencesConcept:'Kemungkinan akibat',
 visualContinuity:'Konsistensi visual',suggestedPalette:'Palet ilustrasi',animationRequired:'Rencana animasi',
 availability:'Ketersediaan',playerDependentState:'Status dengan pemain',canonStatus:'Identitas canonical',
 playableRuntimeConfirmed:'Aktif di dunia permainan',questIntegrationConfirmed:'Misi aktif',
 legacyAssociationApproved:'Kaitan cerita lama disetujui',status:'Status sekarang'
};
export const WARGAPEDIA_HIDDEN_FIELDS=new Set(['ageDesignNote','visualAgeBandDraft','observedIllustrationStyle','publicCameoVisualNotice','canonicalId','portraitKey','conceptPortrait','fullName','name','occupation','fictionNotice','continuityLock','canonStatus','legacyCollisionPolicy','playerDependentState']);

/**
 * Player presentation is NOT a serialized Character Bible.
 * Only specifically reviewed, relevant details belong in Warga.
 * Raw 12-category data, IDs, provenance, approval, future quests and story flags
 * remain authoring data. Never map over all sections in player components.
 */
export type WargaDossier={
 id:string;name:string;occupation:string;portraitUrl:string;
 sections:Record<string,Record<string,unknown>>;
 publicBiography?:{
  sources?:Array<{title:string;url:string}>;
  careerSummary?:Array<{role:string;period:string}>;
 };
};
export type WargaStorySection={title:string;lines:string[]};
export type WargaPlayerView={displayName:string;nickname?:string;sections:WargaStorySection[];sources:Array<{title:string;url:string}>};

export const WARGA_PLAYER_FIELD_POLICY={
 visible:["name","occupation","portraitUrl","communityActivity","workRoutineConcept","originArea","signatureClothing","verifiedPublicCareer","verifiedPublicEducation"],
 developerOnly:["id","portrait","fieldProvenance","visualEvidence","approval","publicationStatus","schemaVersion","continuityLock","legacyAssociationApproved","questIntegrationConfirmed","sideQuestConcept","threeActBeats","playerChoices","sourceFacts","proposedFields"],
 saveOnly:["bonds","personalQuests","storyFlags","talks","met"],
} as const;

/** Display name formatting never mutates canonical identity or search keys. */
export function wargaDisplayName(value:string):string{
 return value.trim().split(/\s+/).map(part=>part.length<=2?part.toLocaleUpperCase("id"):part[0].toLocaleUpperCase("id")+part.slice(1).toLocaleLowerCase("id")).join(" ");
}
function words(x:unknown):string|undefined{
 return typeof x==="string"&&x.trim()?x.trim():undefined;
}
function naturalSentence(x:unknown):string|undefined{
 const s=words(x);
 if(!s||/\b(?:player|pemain|gameplay|runtime|draft|draf|fiksi|konsep|potret canonical|belum ditetapkan|tidak diimplementasikan|lokasi spesifik)\b/i.test(s))return undefined;
 return s.replace(/[.;\s]+$/,"")+".";
}
function areaFromStory(origin:unknown):string|undefined{
 const source=words(origin);
 if(!source)return undefined;
 const places=["Ciwidey","Banjaran","Pangalengan","Soreang","Cimenyan","Baleendah","Majalaya","Ujungberung","Cibaduyut","Cicadas","Kiaracondong","Arcamanik","Regol","Andir","Babakan Ciparay","Buahbatu","Gedebage","Cicendo","Cibiru","Lengkong","Coblong","Sukajadi","Antapani","Cibeunying Kidul","Batununggal","Bojongsoang","Mandalajati","Cicalengka","Pasirluyu"];
 return places.find(place=>new RegExp('\\b'+place+'\\b','i').test(source));
}
const EARLY_WARGA_STORIES:Record<string,string>={
 A02:"Nabila telaten merawat bunga. Ia lebih suka melihat keadaan tanah dan daun sendiri sebelum menentukan apa yang harus dikerjakan.",
 A03:"Ryan selalu memeriksa saluran dari hulu sampai hilir. Catatan yang rapi baginya belum cukup kalau air di ujung kebun masih belum sampai.",
 A04:"Ayu mengenali benih dari cara tumbuhnya, bukan hanya dari bungkusnya. Soal menyiram, ia lebih percaya pada tanah yang disentuh daripada perkiraan.",
 C01:"Nani sudah lama merawat bunga dan pekarangan. Perubahan kecil di kebun sering mengingatkannya pada cerita tetangga yang hampir terlupakan.",
 C08:"Inggit hafal mana hasil kebun yang cepat habis dan mana yang harus segera diolah. Ia tidak suka mengambil stok lebih banyak daripada yang sanggup dijual."
};
function addSection(out:WargaStorySection[],title:string,values:Array<string|undefined>){
 const lines=[...new Set(values.filter((s):s is string=>Boolean(s&&s.trim())))];
 if(lines.length)out.push({title,lines});
}
export function wargaPlayerView(doc:WargaDossier):WargaPlayerView{
 const sections:WargaStorySection[]=[];
 const social=doc.sections["04_social_profile"]??{};
 const core=doc.sections["01_core_identity"]??{};
 const fashion=doc.sections["03_fashion_aesthetic"]??{};
 const nickname=words(core.preferredName);
 const cameo=doc.id==="P01"||doc.id==="P02";
 if(cameo){
  const education=naturalSentence(social.education);
  const origin=words(core.origin)?.split(/[;(]/)[0]?.trim();
  const career=doc.publicBiography?.careerSummary?.slice(-3).map(x=>x.period?x.role+" ("+x.period+")":x.role).join("; ");
  addSection(sections,"Riwayat singkat",[
    origin?"Berasal dari "+origin+".":undefined,
    education,
    career?"Pernah menjalani peran: "+career+".":undefined
  ]);
 }else{
  const intro=EARLY_WARGA_STORIES[doc.id];
  const activity=naturalSentence(social.communityActivity);
  const routine=naturalSentence(social.workRoutineConcept);
  // Work routines referring to a generic work area are authoring placeholders.
  const specificRoutine=routine&&!/\b(?:area kerja|meninjau keadaan|sebelum menerima bantuan|mencari sumber gangguan)\b/i.test(routine)?routine:undefined;
  addSection(sections,"Keseharian",[
    intro,
    intro?undefined:activity,
    intro?undefined:specificRoutine?("Biasanya "+specificRoutine[0].toLocaleLowerCase("id")+specificRoutine.slice(1)):undefined
  ]);
  const area=areaFromStory(core.origin);
  addSection(sections,"Cerita asal",[
    area?"Ada bagian dari kisahnya yang bermula di "+area+".":undefined
  ]);
  const clothing=naturalSentence(fashion.signatureClothing);
  addSection(sections,"Ciri khas",[
    clothing&&!/\b(?:generik|tanpa mengklaim|pixel|gambar|ilustrasi)\b/i.test(clothing)?clothing:undefined
  ]);
 }
 const sources=cameo?(doc.publicBiography?.sources??[]).filter(x=>/^https:\/\//.test(x.url)&&Boolean(x.title)):[];
 return {displayName:wargaDisplayName(doc.name),nickname,sections,sources};
}
