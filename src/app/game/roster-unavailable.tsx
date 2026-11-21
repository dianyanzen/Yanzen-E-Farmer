/** Fail closed: never render legacy residents when the reviewed 248-person roster is missing. */
export default function RosterUnavailable(){
 return <main style={{maxWidth:560,margin:"10vh auto",padding:"2rem",fontFamily:"system-ui, sans-serif"}}>
  <h1>Data warga belum siap</h1>
  <p>Daftar NPC resmi belum tersinkron dengan server. Game tidak akan menampilkan
  identitas lama sebagai pengganti agar nama dan potret warga tidak tertukar.</p>
  <p>Pengelola dapat memeriksa konfigurasi roster privat dan melakukan validasi ulang.</p>
 </main>;
}
