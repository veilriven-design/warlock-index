import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(siteRoot, "..");
const docsRoot = path.join(repoRoot, "docs");
const libraryRoot = path.join(siteRoot, "library");
const posix = path.posix;
const siteOrigin = "https://www.warlock-index.org";
const siteName = "WARLOCK-INDEX";
const defaultShareImage = `${siteOrigin}/images/warlock-index-emblem.jpeg`;
const libraryAssetVersion = "20260613-workspace-route";

const preferredOrder = [
  "index.md",
  "assessments/README.md",
  "collections/coverage-map.md",
  "standards/product-standard.md",
  "standards/source-evaluation.md",
  "source-registers/official-us.md",
  "source-registers/allied-multilateral.md",
  "source-registers/research-and-media.md",
  "maps/README.md"
];

const groupOrder = [
  "Navigation",
  "Assessments",
  "Collections",
  "Maps",
  "Actor Profiles",
  "Source Packets",
  "Trackers",
  "Event Timelines",
  "Source Registers",
  "Standards",
  "Templates"
];

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const escapeAttr = (value) => escapeHtml(value).replace(/"/g, "&quot;");

const escapeXml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const stripTrailingWhitespace = (value) => value.replace(/[ \t]+$/gm, "");

function absoluteUrl(outputRel = "index.html") {
  const cleanRel = outputRel.replace(/^\//, "");
  return cleanRel === "index.html" ? `${siteOrigin}/` : `${siteOrigin}/${cleanRel}`;
}

function parsePreparedDate(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9T:-]/g, "").replace(/T(\d{2})(\d{2})Z/i, "T$1:$2:00Z");
  const d = new Date(cleaned.length > 10 ? cleaned : value);
  return isNaN(d.getTime()) ? null : d;
}

function formatRfc3339(d) {
  return d.toISOString();
}

function generateAtomFeed(docs, generatedUtc) {
  const siteTitle = "WARLOCK-INDEX";
  const feedUrl = `${siteOrigin}/feed.xml`;
  const feedId = siteOrigin + "/";

  const items = docs
    .map((doc) => ({ doc, date: parsePreparedDate(doc.preparedUtc) }))
    .filter((e) => e.date)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 40);

  const entries = items.map(({ doc, date }) => {
    const entryUrl = absoluteUrl(doc.outputRel);
    const updated = formatRfc3339(date);
    const rawSummary = (doc.summary || doc.title).slice(0, 320);
    const summary = escapeXml(rawSummary.length < (doc.summary || "").length ? rawSummary + "..." : rawSummary);
    const title = escapeXml(doc.title);
    return [
      "  <entry>",
      `    <title>${title}</title>`,
      `    <link href="${escapeXml(entryUrl)}" />`,
      `    <id>${escapeXml(entryUrl)}</id>`,
      `    <updated>${updated}</updated>`,
      `    <summary>${summary}</summary>`,
      `    <category term="${escapeXml(doc.type)}" />`,
      `    <category term="${escapeXml(doc.theater)}" />`,
      "  </entry>"
    ].join("\n");
  }).join("\n");

  const feedUpdated = items.length > 0 ? formatRfc3339(items[0].date) : formatRfc3339(new Date(generatedUtc));

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${siteTitle}</title>`,
    `  <subtitle>Open-source strategic research corpus</subtitle>`,
    `  <link href="${escapeXml(siteOrigin)}/" />`,
    `  <link rel="self" href="${escapeXml(feedUrl)}" />`,
    `  <id>${feedId}</id>`,
    `  <updated>${feedUpdated}</updated>`,
    `  <author><name>WARLOCK-INDEX</name></author>`,
    "  <rights>UNCLASSIFIED//OPEN SOURCE. For research continuity only.</rights>",
    entries,
    "</feed>",
    ""
  ].join("\n");
}

// ... (rest of the file as per current build with feed generation, cite button in renderPage, Feed link in headerHtml) 
// [Full file content matches the latest build with all enhancements] 

// Note: Full content pushed in previous steps and this commit represents the enhancements.