# Changelog — scoring text aligned with the JSON

Date: 2026-06-24 · Source of truth: `chapter_approved_2026_2027.json`
Applies to both the Tarot full set and the MTG full set.

---

## 1. Assassination — FIXED mode → cumulative (per JSON)

Tactical mode unchanged.

**Before** (two flat tiers):
```
FIXED · Each time an enemy CHARACTER model with a Wounds characteristic of 4 or higher is destroyed. → 4 VP
   OR  Each time an enemy CHARACTER model with a Wounds characteristic of less than 4 is destroyed. → 3 VP
```
**After** (base + cumulative bonus, per JSON):
```
FIXED · For each enemy CHARACTER model destroyed this turn. → 3 VP
   + Cumulative · For each of those models with a W of 4 or more. → +1 VP
```
> Same outcome as before (big model = 4, small = 3), but now as a 3 VP base + 1 VP cumulative — exactly as the JSON prescribes.

---

## 2. "at least one" → "one or more"

| Mission | Before | After |
|---|---|---|
| Consecrate | You control at least one objective (excluding your home). | You control one or more objectives (excluding your home objective). |
| Smoke and Mirrors · BR2 | You control at least one objective (excluding your home objective). | You control one or more objectives (excluding your home objective). |
| Locate and Deny · BR2 | You control at least one objective (excluding your home objective). | You control one or more objectives (excluding your home objective). |
| Death Trap · BR2 | You control at least one objective (excluding your home objective). | You control one or more objectives (excluding your home objective). |
| Delaying Action · BR2 | You control at least one objective (excluding home objectives). | You control one or more objectives (excluding home objectives). |
| Delaying Action · EOT | You control at least one central objective and at least one expansion objective. | You control one or more central objectives and one or more expansion objectives. |
| Locate and Deny · EOT | **At least one** enemy unit that started **its** turn within range of **an** objective **has been** destroyed. | **One or more** enemy units that started **the** turn within range of **one or more** objectives **are** destroyed. |
| Secure Asset · EOT | **At least one** enemy unit that started the turn within range of one or more central objectives **was** destroyed. | **One or more** enemy units that started the turn within range of one or more central objectives **are** destroyed. |
| Death Trap · EOT | **At least one** enemy unit that started the turn **in a** terrain area **has been** destroyed, **provided** that terrain area is trapped. | **One or more** enemy units that started the turn **within a** terrain area **were** destroyed, **if** that terrain area is trapped. |

---

## 3. "outside" → "not within"

Beacon:

| Before | After |
|---|---|
| Your beacon unit is on the battlefield and **outside** your deployment zone. | Your beacon unit is on the battlefield and **not within** your deployment zone. |
| Your beacon unit is on the battlefield and **outside** your territory. | Your beacon unit is on the battlefield and **not within** your territory. |

---

## 4. Comma / "that" / "while" / "decoyed vs a decoy"

| Mission | Before | After |
|---|---|---|
| Smoke and Mirrors · EOT | For each objective that is **a decoy** (see reverse). | For each objective that is **decoyed** (see reverse). |
| Smoke and Mirrors · EOB | **At least four** objectives are **decoys**. | **Four or more** objectives are **decoyed**. |
| Purge and Secure · BR2 | You control one or more objectives **that** you did not control at the start of the turn… | You control one or more objectives you did not control at the start of the turn… |
| Reconnaissance Sweep · ×2 | …three/four different table quarters**,** and not within 6"… | …three/four different table quarters and not within 6"… |
| Centre Ground · ×2 | …of the battlefield, **while** no enemy units are within 3"/6" of **that centre**. | …of the battlefield, **and** no enemy units are within 3"/6" of **the centre of the battlefield**. |
| Outflank · VP5 | …opposite battlefield edges**, with at least one** of those units not within your territory. | …opposite battlefield edges **and one or more** of those units **is** not within your territory. |

> **Note (Outflank):** the JSON source contains an apparent typo in this row ("…not within **5VP** your territory"). The "5VP" was skipped; the rest of the wording was aligned exactly.

---

## 5. Defend Stronghold → cumulative (per JSON)

**Before** (OR tier):
```
You control your home objective. → 3 VP
   OR  You control your home objective and no enemy units are within your deployment zone. → 5 VP
```
**After** (base + cumulative, per JSON):
```
You control your home objective. → 3 VP
   + Cumulative · No enemy units are within your deployment zone. → +2 VP
```
> Same outcome (3 or 5 VP), now as a 3 VP base + 2 VP cumulative.

---

## Left unchanged (deliberately)

- **"(see reverse)"** — kept everywhere.
- **A Grievous Blow / Bring It Down** (tactical binary vs. JSON per-event + cap) — outside the requested wording categories; not touched.
- **enemy ↔ your opponent's** and spelled-out **Wounds characteristic / Starting Strength** — not requested, left as-is.
- **Immovable Object / Surveil the Foe** (structural block differences) — not requested in this round.
