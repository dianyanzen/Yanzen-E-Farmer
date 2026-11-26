# Merchant standardization — candidate patch

Baseline: 3de31f615. Widi is the interaction and dialogue reference. This first patch separates Iyan's stall and customer-facing standing tile, keeps the existing poultry transaction and quest state, adds safe relocation for a save on the former interaction tile, and switches Iyan's purchase to the existing merchant catalog styling. It keeps both renderers on the common outdoor placement source.

Remaining: integration into the full NPC scheduler and bond system, eight original expression portraits and directional animations, individual item and consumption artwork, egg menu, market art audit, complete CI/browser and real staging QA. Do not release until baseline CI and all applicable QA pass. No change to production or existing monetary rules.

## Visual candidate

Six original pixel product icons: Iyan feed, Inggit egg-sale and four existing menu items. Two independent Iyan stall decorations: bran sack and weighing scale. Each is a separate 56x56 RGBA PNG; no atlas or shared file. Decorations are placed inside the existing stall footprint and hidden when closed. Existing menu/economy and animations unchanged. Both renderer paths share the same outdoor placement source. Asset index and category metadata updated. Actual render, image quality, CI and deployment still require validation. New egg dishes and expression/motion art remain open.
