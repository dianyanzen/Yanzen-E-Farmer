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

