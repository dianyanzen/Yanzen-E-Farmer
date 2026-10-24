export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-950 px-6 text-center text-white">
      <span className="mb-5 text-6xl" role="img" aria-label="Tanaman">🌱</span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Hello Farmers!</h1>
      <p className="mt-5 max-w-lg text-lg text-emerald-100">Selamat datang di Yanzen E-Farmer. Pertanian lebih mudah, tercatat, dan terhubung di cloud.</p>
      <p className="mt-10 rounded-full border border-emerald-500/50 px-5 py-2 text-sm text-emerald-200">Yanzen E-Farmer • Cloud deployment test</p>
      <a href="/dashboard" className="mt-8 rounded-lg bg-emerald-400 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-300">Buka Dashboard</a>
    </main>
  );
}
