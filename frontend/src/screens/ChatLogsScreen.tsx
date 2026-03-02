import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  fetchChatLogs,
  selectChatLogs,
  selectChatLogsLoading,
  selectChatLogsError,
  type FetchChatLogsArgs,
  type ChatLog,
} from "../../src/redux/chatLogsSlice";
import {
  FiRefreshCw,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../css/chatLogs.css";

/* ================= Helpers ================= */

function formatDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function boolLabel(v: boolean | null) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

function pillClass(v: boolean | null) {
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
function classifyStackArea(
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
function classifyIntent(log: ChatLog): "how" | "broken" | "unknown" {
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
function classifyStuckStage(
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
function toYMD(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ================= Screen ================= */

type TimeWindow = "" | "24h" | "7d" | "mon";

export default function ChatLogsScreen() {
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const logs = useSelector((s: RootState) => selectChatLogs(s));
  const loading = useSelector((s: RootState) => selectChatLogsLoading(s));
  const error = useSelector((s: RootState) => selectChatLogsError(s));

  // API-supported filters
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [framework, setFramework] = useState<string>("");
  const [code, setCode] = useState<"" | "true" | "false">("");

  // NEW: specific date filter (YYYY-MM-DD from input[type=date])
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Insight filters (client-side)
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("");
  const [stackArea, setStackArea] = useState<
    "" | "frontend" | "backend" | "database" | "other"
  >("");
  const [intent, setIntent] = useState<"" | "how" | "broken" | "unknown">("");
  const [stuckStage, setStuckStage] = useState<
    | ""
    | "setup"
    | "build"
    | "runtime"
    | "types"
    | "api"
    | "db"
    | "ui"
    | "unknown"
  >("");

  // Row expand
  const [openId, setOpenId] = useState<string | null>(null);

  // NEW: pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50 | 100>(25);

  const args: FetchChatLogsArgs = useMemo(
    () => ({
      search: search.trim() || undefined,
      lang: lang || undefined,
      type: type || undefined,
      framework: framework || undefined,
      code: code === "" ? undefined : code === "true",
    }),
    [search, lang, type, framework, code],
  );

  useEffect(() => {
    dispatch(fetchChatLogs(args));
  }, [dispatch, args]);

  const onRefresh = () => dispatch(fetchChatLogs(args));

  const onClear = () => {
    setSearch("");
    setLang("");
    setType("");
    setFramework("");
    setCode("");

    setSelectedDate("");
    setTimeWindow("");
    setStackArea("");
    setIntent("");
    setStuckStage("");

    setOpenId(null);

    setPage(1);
    setPageSize(25);
  };

  // Dropdown options from data
  const uniqueLangs = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) if (l.language_env) set.add(l.language_env);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) if (l.question_type) set.add(l.question_type);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  const uniqueFrameworks = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) if (l.framework) set.add(l.framework);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  // Apply client-side filters (including NEW: selectedDate)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Specific date filter (matches YYYY-MM-DD)
      if (selectedDate) {
        const ymd = toYMD(log.createdAt);
        if (!ymd) return false;
        if (ymd !== selectedDate) return false;
      }

      // Keep your insight filters (if you re-enable them later)
      if (timeWindow) {
        // NOTE: You commented out UI for timeWindow, but logic stays safe.
        // If you want, you can remove this block entirely.
      }

      if (stackArea) {
        const area = classifyStackArea(log);
        if (area !== stackArea) return false;
      }

      if (intent) {
        const i = classifyIntent(log);
        if (i !== intent) return false;
      }

      if (stuckStage) {
        const s = classifyStuckStage(log);
        if (s !== stuckStage) return false;
      }

      return true;
    });
  }, [logs, selectedDate, timeWindow, stackArea, intent, stuckStage]);

  // NEW: reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setOpenId(null);
  }, [
    search,
    lang,
    type,
    framework,
    code,
    selectedDate,
    timeWindow,
    stackArea,
    intent,
    stuckStage,
  ]);

  // NEW: sort by newest first before paginating (optional but recommended)
  const sortedFilteredLogs = useMemo(() => {
    const copy = [...filteredLogs];
    copy.sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
    return copy;
  }, [filteredLogs]);

  // NEW: pagination derived values
  const totalItems = sortedFilteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedLogs = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return sortedFilteredLogs.slice(start, end);
  }, [sortedFilteredLogs, safePage, pageSize]);

  // Insight stats (kept)
  const insightStats = useMemo(() => {
    const total = filteredLogs.length;

    const langCount = new Map<string, number>();
    const fwCount = new Map<string, number>();
    let backendTotal = 0;
    let backendWithCode = 0;
    let howCount = 0;
    let brokenCount = 0;

    const stageCount = new Map<string, number>();
    const dayCount = new Map<string, number>();

    for (const l of filteredLogs) {
      if (l.language_env)
        langCount.set(l.language_env, (langCount.get(l.language_env) || 0) + 1);
      if (l.framework)
        fwCount.set(l.framework, (fwCount.get(l.framework) || 0) + 1);

      const area = classifyStackArea(l);
      if (area === "backend") {
        backendTotal += 1;
        if (l.has_code === true) backendWithCode += 1;
      }

      const i = classifyIntent(l);
      if (i === "how") howCount += 1;
      if (i === "broken") brokenCount += 1;

      const st = classifyStuckStage(l);
      stageCount.set(st, (stageCount.get(st) || 0) + 1);

      if (l.createdAt) {
        const key = toYMD(l.createdAt);
        if (key) dayCount.set(key, (dayCount.get(key) || 0) + 1);
      }
    }

    const topOf = (m: Map<string, number>) => {
      let best: { k: string; v: number } | null = null;
      for (const [k, v] of m.entries()) {
        if (!best || v > best.v) best = { k, v };
      }
      return best;
    };

    const topLang = topOf(langCount);
    const topFw = topOf(fwCount);

    const perDay = Array.from(dayCount.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7);

    const topStage = topOf(stageCount);

    return {
      total,
      topLang: topLang ? `${topLang.k} (${topLang.v})` : "—",
      topFw: topFw ? `${topFw.k} (${topFw.v})` : "—",
      backendCodeRate:
        backendTotal === 0
          ? "—"
          : `${Math.round((backendWithCode / backendTotal) * 100)}%`,
      howVsBroken:
        total === 0 ? "—" : `${howCount} how • ${brokenCount} broken`,
      topStage: topStage ? `${topStage.k} (${topStage.v})` : "—",
      perDay,
    };
  }, [filteredLogs]);

  const goToPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const pageButtons = useMemo(() => {
    // compact pager: show first, last, and +/-2 around current
    const cur = safePage;
    const set = new Set<number>([
      1,
      totalPages,
      cur - 2,
      cur - 1,
      cur,
      cur + 1,
      cur + 2,
    ]);
    const nums = Array.from(set)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);

    // insert "gaps" marker as 0
    const out: number[] = [];
    for (let i = 0; i < nums.length; i++) {
      out.push(nums[i]);
      const next = nums[i + 1];
      if (next && next - nums[i] > 1) out.push(0);
    }
    return out;
  }, [safePage, totalPages]);

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <nav>
          <div className="sidebar__title">Admin Dashboard</div>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/admins-list")}>Admin List</button>
          <button onClick={() => navigate("/models")}>Manage Models</button>
        </nav>
      </aside>

      <main className="admin-content">
        <div className="chatlogs-page">
          <div className="chatlogs-header">
            <div>
              <h2>Chat Logs</h2>
              <p>
                Filters tuned for insights: stuck points, languages, frameworks,
                code usage, and trends.
              </p>
            </div>

            <div className="chatlogs-header-actions">
              <button
                className="btn btn-ghost"
                onClick={onClear}
                disabled={loading}
              >
                <FiX /> Clear
              </button>
              <button
                className="btn btn-primary"
                onClick={onRefresh}
                disabled={loading}
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>

          <div className="insight-bar">
            <div className="insight-card">
              <div className="insight-k">Total (filtered)</div>
              <div className="insight-v">{insightStats.total}</div>
            </div>
            <div className="insight-card">
              <div className="insight-k">Top language</div>
              <div className="insight-v">{insightStats.topLang}</div>
            </div>
            <div className="insight-card">
              <div className="insight-k">Hardest framework</div>
              <div className="insight-v">{insightStats.topFw}</div>
            </div>
            {/* <div className="insight-card">
              <div className="insight-k">Backend code included</div>
              <div className="insight-v">{insightStats.backendCodeRate}</div>
            </div> */}
            {/* <div className="insight-card">
              <div className="insight-k">How vs broken</div>
              <div className="insight-v">{insightStats.howVsBroken}</div>
            </div> */}
            {/* <div className="insight-card">
              <div className="insight-k">Where stuck most</div>
              <div className="insight-v">{insightStats.topStage}</div>
            </div> */}
          </div>

          <div className="chatlogs-filters insight-filters">
            <div className="filter search">
              <FiSearch className="search-icon" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question / answer / model / source / keywords"
              />
              {search ? (
                <button
                  className="clear-x"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              ) : null}
            </div>

            <div className="filter">
              <label>Language</label>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="">All</option>
                {uniqueLangs.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label>Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
              >
                <option value="">All</option>
                {uniqueFrameworks.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label>Question type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All</option>
                {uniqueTypes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* NEW: specific date picker */}
            <div className="filter">
              <label>Date</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedDate("")}
                    title="Clear date"
                    type="button"
                  >
                    <FiX />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {insightStats.perDay.length ? (
            <div className="daily-strip">
              <div className="daily-title">
                Daily questions (latest 7 days we have loaded)
              </div>
              <div className="daily-items">
                {insightStats.perDay.map(([k, v]) => (
                  <div key={k} className="daily-pill">
                    <span className="d">{k}</span>
                    <span className="n">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* NEW: Pagination bar (top) */}
          <div className="chatlogs-pagination">
            <div className="pager-left">
              <span className="muted">
                Showing{" "}
                <b>
                  {totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, totalItems)}
                </b>{" "}
                of <b>{totalItems}</b>
              </span>
            </div>

            <div className="pager-right">
              <label className="muted">Rows</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as any)}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1}
              >
                Prev
              </button>

              <div className="pager-pages">
                {pageButtons.map((n, idx) =>
                  n === 0 ? (
                    <span key={`gap-${idx}`} className="pager-gap">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      className={`pager-page ${n === safePage ? "active" : ""}`}
                      onClick={() => goToPage(n)}
                    >
                      {n}
                    </button>
                  ),
                )}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>

          <div className="chatlogs-body">
            {loading ? (
              <div className="state-box">
                <div className="spinner" />
                <div>
                  <div className="state-title">Loading logs…</div>
                  <div className="state-sub">Fetching from the server.</div>
                </div>
              </div>
            ) : error ? (
              <div className="state-box error">
                <div>
                  <div className="state-title">Couldn’t load logs</div>
                  <div className="state-sub">{error}</div>
                  <button className="btn btn-primary mt" onClick={onRefresh}>
                    <FiRefreshCw /> Try again
                  </button>
                </div>
              </div>
            ) : !sortedFilteredLogs.length ? (
              <div className="state-box">
                <div>
                  <div className="state-title">No logs match these filters</div>
                  <div className="state-sub">
                    Try clearing filters or picking a different date.
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="chatlogs-table">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>Date</th>
                      <th>Question</th>
                      <th style={{ width: 120 }}>Model</th>
                      <th style={{ width: 140 }}>Source</th>
                      <th style={{ width: 120 }}>Framework</th>
                      <th style={{ width: 110 }}>In-scope</th>
                      <th style={{ width: 120 }}>In-context</th>
                      <th style={{ width: 130 }}>Appropriate</th>
                      <th style={{ width: 90 }}>Code</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedLogs.map((log) => {
                      const isOpen = openId === log.id;

                      return (
                        <Fragment key={log.id}>
                          <tr className={isOpen ? "row-open" : ""}>
                            <td className="mono small">
                              {formatDate(log.createdAt)}
                            </td>

                            <td>
                              <div className="cell-title">
                                {log.question?.trim() ? (
                                  log.question
                                ) : (
                                  <span className="muted">No question</span>
                                )}
                              </div>
                              <div className="cell-meta">
                                <span className="chip">
                                  {log.language_env || "—"}
                                </span>
                                <span className="chip">
                                  {log.question_type || "—"}
                                </span>
                                <span className="chip">
                                  {log.framework || "—"}
                                </span>
                                <span className="chip">
                                  {classifyStackArea(log)}
                                </span>
                                <span className="chip">
                                  {classifyIntent(log)}
                                </span>
                                <span className="chip">
                                  {classifyStuckStage(log)}
                                </span>
                              </div>
                            </td>

                            <td className="mono">{log.modelused || "—"}</td>
                            <td className="truncate">{log.source || "—"}</td>
                            <td className="truncate">{log.framework || "—"}</td>

                            <td>
                              <span className={pillClass(log.inscope)}>
                                {boolLabel(log.inscope)}
                              </span>
                            </td>
                            <td>
                              <span className={pillClass(log.incontext)}>
                                {boolLabel(log.incontext)}
                              </span>
                            </td>
                            <td>
                              <span className={pillClass(log.appropriate)}>
                                {boolLabel(log.appropriate)}
                              </span>
                            </td>
                            <td>
                              <span className={pillClass(log.has_code)}>
                                {boolLabel(log.has_code)}
                              </span>
                            </td>

                            <td className="actions">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() =>
                                  setOpenId((prev) =>
                                    prev === log.id ? null : log.id,
                                  )
                                }
                                aria-label={isOpen ? "Collapse" : "Expand"}
                              >
                                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            </td>
                          </tr>

                          {isOpen ? (
                            <tr className="detail-row">
                              <td colSpan={9}>
                                <div className="detail-grid">
                                  <div className="detail-block">
                                    <div className="detail-label">
                                      Full question
                                    </div>
                                    <div className="detail-text">
                                      {log.question || "—"}
                                    </div>
                                  </div>

                                  <div className="detail-block">
                                    <div className="detail-label">Answer</div>
                                    <div className="detail-text prewrap">
                                      {log.answer || "—"}
                                    </div>
                                  </div>

                                  <div className="detail-kv">
                                    <div className="kv">
                                      <span className="k">Stack area</span>
                                      <span className="v">
                                        {classifyStackArea(log)}
                                      </span>
                                    </div>
                                    <div className="kv">
                                      <span className="k">Intent</span>
                                      <span className="v">
                                        {classifyIntent(log)}
                                      </span>
                                    </div>
                                    <div className="kv">
                                      <span className="k">Where stuck</span>
                                      <span className="v">
                                        {classifyStuckStage(log)}
                                      </span>
                                    </div>
                                    <div className="kv">
                                      <span className="k">Model</span>
                                      <span className="v mono">
                                        {log.modelused || "—"}
                                      </span>
                                    </div>
                                    <div className="kv">
                                      <span className="k">Source</span>
                                      <span className="v">
                                        {log.source || "—"}
                                      </span>
                                    </div>
                                    <div className="kv">
                                      <span className="k">Created</span>
                                      <span className="v mono">
                                        {formatDate(log.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* NEW: Pagination bar (bottom) */}
                <div className="chatlogs-pagination bottom">
                  <div className="pager-left">
                    <span className="muted">
                      Page <b>{safePage}</b> of <b>{totalPages}</b>
                    </span>
                  </div>

                  <div className="pager-right">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => goToPage(1)}
                      disabled={safePage <= 1}
                    >
                      First
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage <= 1}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage >= totalPages}
                    >
                      Next
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={safePage >= totalPages}
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
