#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SECTION_TITLES = {
  primaryMissions: "Primary Missions",
  secondaryMissions: "Secondary Missions",
  forceDispositions: "Force Dispositions",
  missionTwists: "Mission Twists",
  deployments: "Deployments",
  layouts: "Layouts",
  presets: "Presets",
  battleSizes: "Battle Sizes",
};
const VOLATILE_KEYS = new Set(["updated", "compatibleDataVersion"]);
const LOCALE_KEY = /^[a-z]{2}(-[A-Za-z]{2,4})?$/;
const MAX_BODY = 60000;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith("--")) throw new Error(`Unexpected argument: ${argv[i]}`);
    args[argv[i].slice(2)] = argv[i + 1];
  }
  for (const key of ["source", "snapshot", "out"]) {
    if (!args[key]) throw new Error(`Missing --${key}`);
  }
  return args;
}

function isLocalized(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.includes("en") &&
    keys.every((k) => LOCALE_KEY.test(k)) &&
    keys.every((k) => value[k] === null || typeof value[k] === "string")
  );
}

function project(value) {
  if (Array.isArray(value)) return value.map(project);
  if (isLocalized(value)) return value.en;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, project(v)]));
  }
  return value;
}

function projectRoot(data) {
  const projected = project(data);
  for (const key of VOLATILE_KEYS) delete projected[key];
  return projected;
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function slug(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isEntityArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => v && typeof v === "object" && !Array.isArray(v) && ("id" in v || "name" in v))
  );
}

function isPrimitiveArray(value) {
  return Array.isArray(value) && value.every((v) => v === null || typeof v !== "object");
}

function entityKey(entity) {
  return entity.id ?? `name:${entity.name}`;
}

function entityLabel(entity) {
  return typeof entity.name === "string" && entity.name ? entity.name : String(entity.id);
}

function matchEntities(before = [], after = []) {
  const beforeByKey = new Map(before.map((e) => [entityKey(e), e]));
  const afterByKey = new Map(after.map((e) => [entityKey(e), e]));
  const pairs = [];
  const removed = [];
  const added = [];
  for (const [key, entity] of beforeByKey) {
    if (afterByKey.has(key)) pairs.push([entity, afterByKey.get(key)]);
    else removed.push(entity);
  }
  for (const [key, entity] of afterByKey) {
    if (!beforeByKey.has(key)) added.push(entity);
  }
  for (const entity of [...removed]) {
    const match = added.find((a) => a.name === entity.name);
    if (match) {
      pairs.push([entity, match]);
      removed.splice(removed.indexOf(entity), 1);
      added.splice(added.indexOf(match), 1);
    }
  }
  return { pairs, removed, added };
}

function diffValues(before, after, path, out) {
  if (JSON.stringify(before) === JSON.stringify(after)) return out;
  if (isPrimitiveArray(before) && isPrimitiveArray(after)) {
    const gone = before.filter((v) => !after.includes(v));
    const fresh = after.filter((v) => !before.includes(v));
    if (gone.length || fresh.length) out.push({ path, kind: "set", removed: gone, added: fresh });
    else out.push({ path, kind: "order" });
    return out;
  }
  if (isEntityArray(before) || isEntityArray(after)) {
    const { pairs, removed, added } = matchEntities(before ?? [], after ?? []);
    for (const entity of removed) out.push({ path: `${path}["${entityLabel(entity)}"]`, kind: "removed" });
    for (const entity of added) out.push({ path: `${path}["${entityLabel(entity)}"]`, kind: "added" });
    for (const [b, a] of pairs) diffValues(b, a, `${path}["${entityLabel(a)}"]`, out);
    return out;
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length);
    for (let i = 0; i < length; i++) diffValues(before[i], after[i], `${path}[${i}]`, out);
    return out;
  }
  const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (isObject(before) && isObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of keys) diffValues(before[key], after[key], path ? `${path}.${key}` : key, out);
    return out;
  }
  out.push({ path, kind: "value", before, after });
  return out;
}

function listCardFiles(repoRoot) {
  try {
    return execFileSync("git", ["ls-files", "--", "*.png"], { cwd: repoRoot, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function cardKey(path) {
  const parts = path.split("/");
  const file = parts[parts.length - 1];
  if (parts[0] === "terrain") return { key: `terrain/${file}`, variant: parts.slice(1, -1).join("/") };
  return { key: `${parts[parts.length - 2]}/${file}`, variant: parts.slice(0, -2).join("/") };
}

function findCards(files, predicate) {
  const grouped = new Map();
  for (const path of files) {
    const parts = path.split("/");
    const file = parts[parts.length - 1];
    const deck = parts[parts.length - 2];
    if (!predicate({ path, parts, file, deck })) continue;
    const { key, variant } = cardKey(path);
    if (!grouped.has(key)) grouped.set(key, new Set());
    grouped.get(key).add(variant);
  }
  return grouped;
}

function startsWithSlug(file, name) {
  const s = slug(name);
  return s && (file === `${s}.png` || file.startsWith(`${s}-`));
}

function terrainMatchups(layoutName) {
  const base = String(layoutName).replace(/\s*-\s*Layout\s+\S+\s*$/i, "");
  const sides = base.split("/").map((s) => slug(s)).filter(Boolean);
  if (sides.length !== 2) return [];
  if (sides[0] === sides[1]) return [`${sides[0]}-mirror`];
  return [`${sides[0]}-vs-${sides[1]}`, `${sides[1]}-vs-${sides[0]}`];
}

function terrainPredicate(layoutNames) {
  const matchups = layoutNames.flatMap(terrainMatchups);
  return ({ parts, file }) => parts[0] === "terrain" && matchups.some((m) => file.startsWith(`${m}-`));
}

function cardsFor(section, entities, context) {
  const { files, layoutsBefore, layoutsAfter } = context;
  const names = [...new Set(entities.map((e) => e?.name).filter(Boolean))];
  switch (section) {
    case "primaryMissions": {
      const decks = new Set(
        entities.flatMap((e) => (e?.forceDispositions ?? []).map((fd) => slug(fd.friendly ?? ""))),
      );
      return findCards(
        files,
        ({ parts, deck, file }) =>
          parts[0] !== "terrain" && decks.has(deck) && names.some((n) => startsWithSlug(file, n)),
      );
    }
    case "secondaryMissions":
      return findCards(
        files,
        ({ deck, file }) =>
          (deck === "attacker-secondary-missions" || deck === "defender-secondary-missions") &&
          names.some((n) => startsWithSlug(file, n)),
      );
    case "forceDispositions":
      return findCards(
        files,
        ({ deck, file }) =>
          (deck === "force-disposition" && names.some((n) => file === `${slug(n)}.png`)) ||
          (deck === "card-backs" && names.some((n) => file.startsWith(`back-${slug(n)}-`))),
      );
    case "layouts":
      return findCards(files, terrainPredicate(names));
    case "presets":
      return findCards(files, terrainPredicate(entities.map((e) => e?.layout).filter(Boolean)));
    case "deployments": {
      const layouts = [...layoutsBefore, ...layoutsAfter]
        .filter((l) => (l.deployments ?? []).some((d) => names.includes(d)))
        .map((l) => l.name);
      return findCards(files, terrainPredicate(layouts));
    }
    default:
      return new Map();
  }
}

function code(value) {
  const text = value === undefined ? "(none)" : JSON.stringify(value);
  const fence = text.includes("`") ? "``" : "`";
  return `${fence}${text}${fence}`;
}

function isLongText(value) {
  return typeof value === "string" && (value.length > 80 || value.includes("\n"));
}

function renderChange(change) {
  const path = `\`${change.path || "(root)"}\``;
  switch (change.kind) {
    case "added":
      return { line: `- ${path}: added` };
    case "removed":
      return { line: `- ${path}: removed` };
    case "order":
      return { line: `- ${path}: order changed` };
    case "set": {
      const bits = [];
      if (change.added.length) bits.push(`added ${change.added.map(code).join(", ")}`);
      if (change.removed.length) bits.push(`removed ${change.removed.map(code).join(", ")}`);
      return { line: `- ${path}: ${bits.join("; ")}` };
    }
    default: {
      if (isLongText(change.before) || isLongText(change.after)) {
        const lines = [];
        if (change.before !== undefined && change.before !== null) {
          lines.push(...String(change.before).split("\n").map((l) => `- ${l}`));
        }
        if (change.after !== undefined && change.after !== null) {
          lines.push(...String(change.after).split("\n").map((l) => `+ ${l}`));
        }
        return {
          line: `- ${path}: text changed`,
          block: ["```diff", ...lines, "```"].join("\n"),
        };
      }
      return { line: `- ${path}: ${code(change.before)} → ${code(change.after)}` };
    }
  }
}

function renderCards(cards, withVariants = true) {
  return [...cards.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, variants]) => (withVariants ? `\`${key}\` (${[...variants].sort().join(", ")})` : `\`${key}\``));
}

function buildReport(before, after, meta, files) {
  const sections = [];
  const summary = [];
  const allCards = new Map();
  const context = {
    files,
    layoutsBefore: before.layouts ?? [],
    layoutsAfter: after.layouts ?? [],
  };
  const addCards = (cards) => {
    for (const [key, variants] of cards) {
      if (!allCards.has(key)) allCards.set(key, new Set());
      for (const v of variants) allCards.get(key).add(v);
    }
  };

  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  const sectionKeys = keys.filter((k) => isEntityArray(before[k]) || isEntityArray(after[k]));
  const settingKeys = keys.filter((k) => !sectionKeys.includes(k));

  const settingChanges = [];
  for (const key of settingKeys) diffValues(before[key], after[key], key, settingChanges);
  if (settingChanges.length) {
    const lines = ["### Pack settings", ""];
    for (const change of settingChanges) {
      const { line, block } = renderChange(change);
      lines.push(line);
      if (block) lines.push("", block, "");
    }
    sections.push(lines.join("\n").trimEnd());
  }

  for (const key of sectionKeys) {
    const title = SECTION_TITLES[key] ?? key;
    const { pairs, removed, added } = matchEntities(before[key] ?? [], after[key] ?? []);
    const modified = pairs
      .map(([b, a]) => ({ before: b, after: a, changes: diffValues(b, a, "", []) }))
      .filter((m) => m.changes.length);
    if (!added.length && !removed.length && !modified.length) continue;
    summary.push(`| ${title} | ${added.length} | ${removed.length} | ${modified.length} |`);

    const lines = [`### ${title}`, ""];
    const entityBlock = (label, entities, changes) => {
      lines.push(`#### ${label}`, "");
      const cards = cardsFor(key, entities, context);
      addCards(cards);
      if (cards.size) lines.push(`Cards: ${renderCards(cards, false).join(", ")}`, "");
      else if (["primaryMissions", "secondaryMissions", "forceDispositions", "layouts", "presets", "deployments"].includes(key)) {
        lines.push("Cards: no existing card found", "");
      }
      if (!changes) return;
      const blocks = [];
      for (const change of changes) {
        const { line, block } = renderChange(change);
        lines.push(line);
        if (block) blocks.push(`${line.replace(/^- /, "")}\n\n${block}`);
      }
      if (blocks.length) {
        lines.push("", "<details><summary>Text changes</summary>", "", blocks.join("\n\n"), "", "</details>");
      }
      lines.push("");
    };
    for (const entity of added) entityBlock(`Added: ${entityLabel(entity)}`, [entity]);
    for (const entity of removed) entityBlock(`Removed: ${entityLabel(entity)}`, [entity]);
    for (const m of modified) {
      const label =
        entityLabel(m.before) === entityLabel(m.after)
          ? entityLabel(m.after)
          : `${entityLabel(m.before)} → ${entityLabel(m.after)}`;
      entityBlock(`Modified: ${label}`, [m.before, m.after], m.changes);
    }
    sections.push(lines.join("\n").trimEnd());
  }

  const commitLink = meta.commit
    ? `[${meta.repository}@${meta.commit.slice(0, 7)}](https://github.com/${meta.repository}/commit/${meta.commit})`
    : meta.repository;
  const header = [
    "## Mission data update from datasources",
    "",
    `Source: ${commitLink}, \`${meta.path}\`, data version ${meta.dataVersion ?? "unknown"}, updated ${meta.updated ?? "unknown"}.`,
    "",
    "This PR updates the English mission data snapshot in `data/`. The card artwork is not regenerated automatically. Re-render the cards listed below, run `scripts/optimize-cards.sh` on them and push the images to this branch before merging.",
    "",
  ];
  if (summary.length) {
    header.push("| Section | Added | Removed | Modified |", "| --- | ---: | ---: | ---: |", ...summary, "");
  }
  if (allCards.size) {
    header.push("### Cards to re-render", "", ...renderCards(allCards).map((c) => `- [ ] ${c}`), "");
  } else {
    header.push("No existing card images matched these changes. Check whether the change affects any card.", "");
  }
  const marker = `<!-- missions-sync-hash: ${meta.contentHash} -->`;
  const full = `${header.join("\n")}\n${sections.join("\n\n")}\n\n${marker}\n`;
  if (full.length <= MAX_BODY) return { full, body: full };
  const note = "\n\n_The detailed change list is too long for the PR description. See the workflow run summary for the full report._\n\n";
  const body = `${header.join("\n")}${note}${marker}\n`;
  return { full, body: body.length <= MAX_BODY ? body : `${body.slice(0, MAX_BODY - marker.length - 20)}\n\n${marker}\n` };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = JSON.parse(readFileSync(args.source, "utf8"));
  const after = projectRoot(source);
  const afterText = serialize(after);
  const beforeText = existsSync(args.snapshot) ? readFileSync(args.snapshot, "utf8") : null;
  const before = beforeText ? JSON.parse(beforeText) : {};

  if (beforeText !== null && JSON.stringify(before) === JSON.stringify(after)) {
    process.stdout.write("changed=false\n");
    return;
  }

  const meta = {
    repository: args.repository ?? "game-datacards/datasources",
    path: args.path ?? args.source,
    commit: args.commit ?? null,
    dataVersion: source.compatibleDataVersion ?? null,
    updated: source.updated ?? null,
    contentHash: sha256(afterText),
  };

  mkdirSync(args.out, { recursive: true });
  writeFileSync(join(args.out, "snapshot.json"), afterText);
  writeFileSync(join(args.out, "source.json"), serialize(meta));
  const { full, body } = buildReport(before, after, meta, listCardFiles(args.repo ?? "."));
  writeFileSync(join(args.out, "report.md"), full);
  writeFileSync(join(args.out, "pr-body.md"), body);

  process.stdout.write(`changed=true\ndata_version=${meta.dataVersion ?? ""}\nhash=${meta.contentHash}\n`);
}

main();
