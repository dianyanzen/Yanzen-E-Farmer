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
  // Populate a fully progressed game before resetting. All rewards, NPC bonds,
  // personal quests, dialogue choices and story records must become indistinguishable
  // from a freshly created profile after the server's canonical reset.
  const initial = newGame();
  const progressed = {
    ...initial, day: 14, minutes: 1080, coins: 5600, seeds: 3, harvested: 24,
    phoneRead: true, walkingSteps: 320, nurseryChecked: true, sluiceOpen: true,
    stats: { ...initial.stats, xp: 760, actions: 85, harvests: 12, conversations: 9, nights: 13 },
    bonds: {
      ...initial.bonds,
      A03: { ...initial.bonds.A03, points: 280, talks: 7, lastTalkDay: 14 },
      C08: { ...initial.bonds.C08, points: 160, talks: 4, lastTalkDay: 12 },
    },
    story: { ...initial.story, orderAccepted: true, orderDone: true, canalClue: true,
      photoSeen: true, photoChoice: 'nani', completedDay: 12 },
    personalQuests: { A03: { phase: 4, day: 12, baseline: 0 }, C08: { phase: 2, day: 13, baseline: 0 } },
    fishing: { ...initial.fishing, bait: 9, fish: { bandeng: 2, kakap_putih: 1, belanak: 3 },
      caught: 6, sold: 2, seedPacks: 4, cropsSold: 12 },
    bagTier: 2, carriedTools: ['hoe','water','fishing_rod'], storedTools: ['axe','sickle','pickaxe'],
  };
  assert.ok(safeLoad(progressed), 'simulated progressed game must be valid');
  await db.query(`insert into yz_game_saves(user_id,version,data) values($1,1,$2::jsonb)
    on conflict(user_id) do update set data=excluded.data,updated_at=now()`, [first, JSON.stringify(progressed)]);
  const beforeReset = (await db.query('select updated_at from yz_game_saves where user_id=$1', [first])).rows[0].updated_at;

  const fresh = newGame();
  const revision = new Date(Math.max(Date.now(),new Date(beforeReset).getTime()+1)).toISOString();
  await db.query(`insert into yz_game_saves(user_id,version,data,updated_at) values($1,1,$2::jsonb,$3::timestamptz)
    on conflict(user_id) do update set data=excluded.data,updated_at=excluded.updated_at`, [first, JSON.stringify(fresh), revision]);
  const resetRows = (await db.query('select data from yz_game_saves where user_id=$1', [first])).rows;
  assert.equal(resetRows.length,1,"reset preserves the account's game save slot");
  const restarted = safeLoad(resetRows[0].data);
  assert.ok(restarted,'reset save must reload successfully');
  assert.deepEqual(JSON.parse(JSON.stringify(restarted)),
    JSON.parse(JSON.stringify(safeLoad(newGame()))),
    'all persisted progress must match a first-time game, including NPC bonds, quests, stats and story');
  assert.equal(restarted.day,1,'reset returns to first day');
  assert.equal(restarted.coins,280,'starting money is restored');
  assert.equal(restarted.seeds,12,'starting seeds are restored');
  assert.equal(restarted.harvested,0,'harvest totals are cleared');
  assert.equal(restarted.plots.length,0,'farm progress is cleared');
  assert.equal(restarted.stats.xp,0,'experience is cleared');
  assert.equal(restarted.stats.harvests,0,'statistics are cleared');
  assert.equal(restarted.story.photoChoice,null,'narrative choices are cleared');
  assert.equal(restarted.personalQuests?.A03,undefined,'completed NPC missions are cleared');
  assert.equal(restarted.personalQuests?.C08,undefined,'active NPC missions are cleared');
  assert.equal(restarted.bonds.A03.points,0,'NPC closeness returns to zero');
  assert.equal(restarted.bonds.A03.talks,0,'NPC conversation history is cleared');
  assert.equal(restarted.fishing.caught,0,'caught fish history is cleared');
  assert.equal(restarted.fishing.bait,0,'earned fishing bait is returned to initial value');
  assert.equal(restarted.sluiceOpen,false,'sluice story world state is reset');

  // Stale autosave with the pre-reset revision must not restore old progress.
  const stale = await db.query(`update yz_game_saves set data=$2::jsonb
    where user_id=$1 and updated_at=$3::timestamptz returning user_id`,
    [first, JSON.stringify(progressed), beforeReset]);
  assert.equal(stale.rows.length,0,'old tabs cannot resurrect pre-reset progress');
  assert.equal((await db.query('select data from yz_game_saves where user_id=$1',[first])).rows[0].data.day,1);

  await db.exec(`set request.jwt.claim.sub='${second}';`);
  assert.equal((await db.query('select * from yz_game_saves')).rows.length, 0, 'other account cannot read save');
  assert.equal((await db.query('update yz_game_saves set data=\'{}\'::jsonb where user_id=$1 returning user_id', [first])).rows.length, 0);
  await assert.rejects(db.query(`insert into yz_game_saves(user_id,data) values($1,'{}')
    on conflict(user_id) do update set data=excluded.data`, [first]), /row-level security/);
  await db.exec('reset role; set role anon;');
  await assert.rejects(db.query('select * from yz_game_saves'), /permission denied/);
  console.log('Chapter save JSONB roundtrip (both endings), version 1 and account isolation: PASS');
} finally { await db.close(); }
