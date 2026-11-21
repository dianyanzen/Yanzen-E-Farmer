import { Pool } from "pg";

declare global {
  var yzFarmPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!process.env.PGHOST || !process.env.PGDATABASE || !process.env.PGUSER || !process.env.PGPASSWORD) {
    throw new Error("PostgreSQL connection settings are incomplete.");
  }

  if (!globalThis.yzFarmPool) {
    const pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT ?? "5432"),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
    pool.on("error", error => console.error("Idle PostgreSQL connection failed:", error));
    globalThis.yzFarmPool = pool;
  }

  return globalThis.yzFarmPool;
}
