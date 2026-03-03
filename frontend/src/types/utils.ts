/* ================= Helpers ================= */

import type { ChatLog } from "./ChatLog";

export function formatDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function boolLabel(v: boolean | null) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

export function pillClass(v: boolean | null) {
  if (v === true) return "pill pill-yes";
  if (v === false) return "pill pill-no";
  return "pill pill-na";
}

function safeLower(s: string | null | undefined) {
  return (s || "").toLowerCase();
}

function includesAny(haystack: string, needles: string[]) {
  return needles.some((n) => haystack.includes(n));
}

/** Rough “stack area” classifier for insight questions */
export function classifyStackArea(
  log: ChatLog,
): "frontend" | "backend" | "database" | "other" {
  const q = safeLower(log.question);
  const a = safeLower(log.answer);
  const f = safeLower(log.framework);
  const t = safeLower(log.question_type);

  const text = `${q} ${a} ${f} ${t}`;

  const dbWords = [
    "sql",
    "postgres",
    "mysql",
    "mongodb",
    "mongo",
    "sqlite",
    "database",
    "db",
    "prisma",
    "typeorm",
    "sequelize",
    "supabase",
    "firebase",
    "firestore",
    "query",
    "index",
    "migration",
    "schema",
    "join",
  ];

  const feWords = [
    "react",
    "react native",
    "vue",
    "angular",
    "svelte",
    "css",
    "html",
    "dom",
    "tailwind",
    "bootstrap",
    "ui",
    "component",
    "redux",
    "vite",
    "next",
    "nuxt",
  ];

  const beWords = [
    "node",
    "express",
    "nestjs",
    "fastify",
    "api",
    "endpoint",
    "server",
    "backend",
    "auth",
    "jwt",
    "middleware",
    "controller",
    "route",
    "cors",
    "http",
    "rest",
    "graphql",
    "supabase functions",
  ];

  if (includesAny(text, dbWords)) return "database";
  if (includesAny(text, feWords)) return "frontend";
  if (includesAny(text, beWords)) return "backend";
  return "other";
}

/** “How it works” vs “code broken” classifier */
export function classifyIntent(log: ChatLog): "how" | "broken" | "unknown" {
  const q = safeLower(log.question);
  if (!q) return "unknown";

  const howWords = [
    "how",
    "what is",
    "explain",
    "difference",
    "why does",
    "best way",
  ];
  const brokenWords = [
    "error",
    "bug",
    "broken",
    "not working",
    "doesn't work",
    "failed",
    "exception",
    "stack trace",
    "undefined",
    "null",
    "cannot",
    "typeerror",
    "referenceerror",
    "ts(2322)",
    "compile",
    "build",
  ];

  if (includesAny(q, brokenWords)) return "broken";
  if (includesAny(q, howWords)) return "how";
  return "unknown";
}

/** “Where stuck” classifier (bug stage) */
export function classifyStuckStage(
  log: ChatLog,
): "setup" | "build" | "runtime" | "types" | "api" | "db" | "ui" | "unknown" {
  const q = safeLower(log.question);
  const a = safeLower(log.answer);
  const text = `${q} ${a}`;

  if (
    includesAny(text, [
      "install",
      "setup",
      "env",
      "dotenv",
      "npm i",
      "yarn add",
    ])
  )
    return "setup";
  if (
    includesAny(text, ["build", "compile", "vite", "webpack", "tsc", "babel"])
  )
    return "build";
  if (
    includesAny(text, [
      "type",
      "typescript",
      "ts(",
      "noimplicitany",
      "interface",
      "generic",
    ])
  )
    return "types";
  if (
    includesAny(text, [
      "endpoint",
      "api",
      "fetch",
      "axios",
      "cors",
      "401",
      "403",
    ])
  )
    return "api";
  if (
    includesAny(text, [
      "sql",
      "db",
      "database",
      "migration",
      "prisma",
      "sequelize",
      "firebase",
      "firestore",
    ])
  )
    return "db";
  if (includesAny(text, ["css", "align", "layout", "padding", "margin", "ui"]))
    return "ui";
  if (
    includesAny(text, [
      "crash",
      "runtime",
      "undefined",
      "null",
      "cannot read",
      "exception",
    ])
  )
    return "runtime";

  return "unknown";
}

/** Date helpers */
export function toYMD(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ================= Screen ================= */

export type TimeWindow = "" | "24h" | "7d" | "mon";
