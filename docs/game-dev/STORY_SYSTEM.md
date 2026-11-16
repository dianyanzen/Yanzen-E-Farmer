# Living Stories — Narrative Engine Specification v0.1

## Story design target
Keep the game emotionally engaging over years of in-game time **without claiming infinite hand-authored story**. Players should revisit a location because events, characters and consequences have changed, not because a quest icon forces a daily chore.

## NPC world model
Each of 32 reference IDs eventually maps to one fictional character with:
- **Public identity:** name, livelihood, house district, favorite places, social graph, speaking style.
- **Private motivation:** goals, insecurity, secret and tension, not always player-centered.
- **Time schedule:** work, commute, dinner, festival, rain-specific behavior.
- **Relationship state:** friendship/romance where appropriate and separately negotiated boundaries; trust is not identical to affection.
- **Memory:** facts witnessed, rumors heard, favors offered, promises broken, trust restored.
- **Story flags:** authored triggers and timestamps.
- **Messages:** YZ Phone push notifications relevant to ongoing arcs, with opt-in filters.

## Proposed data shape
```json
{
  "storyId": "regol-canal-001",
  "district": "Regol",
  "title": "Saluran Lama Pasirluyu",
  "priority": 80,
  "requires": ["met:A03", "day>=3"],
  "excludes": ["resolved:canal-001"],
  "availableAt": ["irrigation-edge", "community-centre"],
  "choices": [
    { "id": "investigate", "setFlags": ["A03:trust+1", "canal:investigation"], "unlocks": ["regol-photo-002"] },
    { "id": "ask-neighbor", "setFlags": ["sari:quest-intro"], "unlocks": ["regol-memory-003"] }
  ],
  "cooldownDays": 0
}
```

Example only. This is **not deployed** as a real content schema. The engine later validates predicates with a safe, declarative evaluator (never eval untrusted expressions).

## Writing rules
- Write character voices in Indonesian with restrained local Sundanese flavor; avoid caricatures and forced stereotypical dialect.
- Show a meaningful choice at least once per multi-scene chain, not every mundane line.
- Player choices should have plausible positive/negative tradeoffs, not omniscient outcomes.
- NPC-to-NPC activity happens even if the protagonist ignores the event; some situations resolve themselves.
- Track every significant player choice in game save and ensure dialogue continuity.
- Protect player from losing important arcs if they do not play for a real-life day.
- Notifications serve a story beat; cap low-priority daily notification bursts.
- Three story layers: handmade campaign, character storylines, smaller world-state storylets.
- Cultural references and Bandung historical facts require source notes, not invented pseudo-history.

## Acceptance tests
- Completing or ignoring an NPC's request causes coherent follow-up.
- Reopening phone chat never duplicates a paid quest reward.
- Moving between areas does not reset memories.
- Two contradictory story branches never become active at the same time.
- Every quest remains completable or closes with a believable alternate outcome.
- Narrative save migrations preserve flags and NPC relations.
