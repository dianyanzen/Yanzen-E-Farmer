import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
try {
  await db.exec(await readFile(new URL("../database/yz-farm-life.sql", import.meta.url), "utf8"));

  const first = (await db.query(
    "INSERT INTO yz_game_users (email, password_hash) VALUES ($1, $2) RETURNING id",
    ["petani@example.test", "scrypt-test-hash"],
  )).rows[0].id;
  const second = (await db.query(
    "INSERT INTO yz_game_users (email, password_hash) VALUES ($1, $2) RETURNING id",
    ["tetangga@example.test", "scrypt-test-hash"],
  )).rows[0].id;

  await assert.rejects(
    db.query("INSERT INTO yz_game_users (email, password_hash) VALUES ($1, $2)", ["petani@example.test", "duplicate"]),
    /unique|duplicate/i,
  );
  await db.query(
    "INSERT INTO yz_game_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '30 days')",
    [first, "a".repeat(64)],
  );

  const initialSave = { version: 1, day: 1, location: "field", player: { x: 4, y: 8 } };
  await db.query(
    "INSERT INTO yz_game_saves (user_id, data) VALUES ($1, $2::jsonb)",
    [first, JSON.stringify(initialSave)],
  );
  assert.deepEqual((await db.query("SELECT data FROM yz_game_saves WHERE user_id = $1", [first])).rows[0].data, initialSave);
  assert.equal((await db.query("SELECT data FROM yz_game_saves WHERE user_id = $1", [second])).rows.length, 0);

  const updatedSave = { ...initialSave, coins: 25 };
  await db.query(
    `INSERT INTO yz_game_saves (user_id, data) VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [first, JSON.stringify(updatedSave)],
  );
  assert.deepEqual((await db.query("SELECT data FROM yz_game_saves WHERE user_id = $1", [first])).rows[0].data, updatedSave);
  await assert.rejects(
    db.query("INSERT INTO yz_game_saves (user_id, data) VALUES ($1, '[]'::jsonb)", [second]),
    /yz_game_save_object/i,
  );
  await assert.rejects(
    db.query("INSERT INTO yz_game_saves (user_id, data) VALUES ($1, $2::jsonb)", [
      second,
      JSON.stringify({ payload: "x".repeat(132000) }),
    ]),
    /yz_game_save_limit/i,
  );

  console.log("Standalone PostgreSQL schema, account isolation and bounded save tests: PASS");
} finally {
  await db.close();
}
