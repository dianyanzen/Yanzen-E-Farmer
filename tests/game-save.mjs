import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';

const compiled = ts.transpileModule(await readFile('src/lib/game/model.ts', 'utf8'), { compilerOptions: {
  esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
} }).outputText;
const mod = { exports: {} };
vm.runInNewContext(compiled, { exports: mod.exports, module: mod,
  require: createRequire(new URL('../src/lib/game/model.ts', import.meta.url)) });
const { newGame, choosePhoto, safeLoad } = mod.exports;
const db = new PGlite();
const first = '10000000-0000-0000-0000-000000000001';
const second = '10000000-0000-0000-0000-000000000002';
try {
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
    $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth, public to authenticated;
    grant execute on function auth.uid() to authenticated;
    insert into auth.users values('${first}'),('${second}');`);
  await db.exec(await readFile('supabase/migrations/20261116000100_yz_game_saves.sql', 'utf8'));
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${first}';`);
  for (const choice of ['nani', 'warung']) {
    const initial = newGame();
    const state = choosePhoto({ ...initial, story: { ...initial.story,
      orderAccepted: true, orderDone: true, canalClue: true, photoSeen: true } }, choice);
    await db.query(`insert into yz_game_saves(user_id,version,data) values($1,1,$2::jsonb)
      on conflict(user_id) do update set data=excluded.data,updated_at=now()`, [first, JSON.stringify(state)]);
    const { rows } = await db.query('select version,data from yz_game_saves where user_id=$1', [first]);
    assert.equal(rows[0].version, 1);
    const restored = safeLoad(rows[0].data);
    assert.equal(restored.story.photoChoice, choice);
    assert.equal(restored.story.completedDay, 1);
  }
  await db.exec(`set request.jwt.claim.sub='${second}';`);
  assert.equal((await db.query('select * from yz_game_saves')).rows.length, 0, 'other account cannot read save');
  assert.equal((await db.query('update yz_game_saves set data=\'{}\'::jsonb where user_id=$1 returning user_id', [first])).rows.length, 0);
  await assert.rejects(db.query(`insert into yz_game_saves(user_id,data) values($1,'{}')
    on conflict(user_id) do update set data=excluded.data`, [first]), /row-level security/);
  await db.exec('reset role; set role anon;');
  await assert.rejects(db.query('select * from yz_game_saves'), /permission denied/);
  console.log('Chapter save JSONB roundtrip (both endings), version 1 and account isolation: PASS');
} finally { await db.close(); }
