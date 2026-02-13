import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/faqScreen.css";

type Period = "daily" | "weekly" | "monthly";

type Faq = {
  id: string;
  question: string;
  answer: string;
  tag?: "General" | "Models" | "Security" | "Troubleshooting";
};

const FAQS: Faq[] = [
  {
    id: "1",
    question: "How do I choose the right model?",
    answer:
      "Use Trinity for navigation/support, Nemotron for policy & compliance, and Stepfun for technical/logical queries.",
    tag: "Models",
  },
  {
    id: "2",
    question: "Why is my chatbot taking long to respond?",
    answer:
      "Response time depends on the selected model, network speed, and question complexity.",
    tag: "Troubleshooting",
  },
  {
    id: "3",
    question: "Can I edit, delete, or hide models?",
    answer:
      "Yes. Use Manage Models in the admin dashboard to add, edit, delete, or hide models based on your permissions.",
    tag: "General",
  },
  {
    id: "4",
    question: "What should I use for policy questions?",
    answer:
      "Use Nemotron for policy and compliance-related questions to follow rules and governance guidance.",
    tag: "Security",
  },
];

/** UI-only static analysis data (replace with backend later) */
const ANALYSIS: Record<
  Period,
  {
    totalChats: number;
    uniqueUsers: number;
    avgResponseSec: number;
    p95ResponseSec: number;
    modelUsage: { trinity: number; nemotron: number; stepfun: number };
    topQuestions: string[];
    compliance: { flagged: number; safe: number };
  }
> = {
  daily: {
    totalChats: 128,
    uniqueUsers: 23,
    avgResponseSec: 1.4,
    p95ResponseSec: 3.6,
    modelUsage: { trinity: 44, nemotron: 29, stepfun: 55 },
    topQuestions: [
      "How do I reset my password?",
      "Which model should I use for support queries?",
      "Why is the chatbot slow sometimes?",
    ],
    compliance: { flagged: 6, safe: 122 },
  },
  weekly: {
    totalChats: 892,
    uniqueUsers: 141,
    avgResponseSec: 1.6,
    p95ResponseSec: 4.2,
    modelUsage: { trinity: 310, nemotron: 210, stepfun: 372 },
    topQuestions: [
      "How do I add a new AI model?",
      "What is Nemotron used for?",
      "How do I export analysis reports?",
    ],
    compliance: { flagged: 41, safe: 851 },
  },
  monthly: {
    totalChats: 3620,
    uniqueUsers: 612,
    avgResponseSec: 1.7,
    p95ResponseSec: 4.8,
    modelUsage: { trinity: 1210, nemotron: 860, stepfun: 1550 },
    topQuestions: [
      "How do I update model parameters?",
      "Can I hide a model from users?",
      "How do I improve response accuracy?",
    ],
    compliance: { flagged: 162, safe: 3458 },
  },
};

function formatSec(n: number) {
  return `${n.toFixed(1)}s`;
}

export default function FaqPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);
  const [period, setPeriod] = useState<Period>("daily");

  const data = ANALYSIS[period];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        (f.tag ?? "").toLowerCase().includes(q),
    );
  }, [search]);

  const periodTitle =
    period === "daily" ? "Daily" : period === "weekly" ? "Weekly" : "Monthly";

  const totalModelChats =
    data.modelUsage.trinity +
    data.modelUsage.nemotron +
    data.modelUsage.stepfun;

  const pct = (x: number) =>
    totalModelChats === 0
      ? "0%"
      : `${Math.round((x / totalModelChats) * 100)}%`;

  return (
    <div className="faqs-shell">
      {/* SIDEBAR (your exact code) */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          {/* If Profile is a route, navigate to it */}
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          {/* if add document lives on dashboard, navigate there */}
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/models")}>
            Manage Models
          </button>{" "}
          <button onClick={() => navigate("/faqs")}>FAQ</button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="faqs-content">
        {/* Header */}
        <header className="faqs-header">
          <div className="faqs-title">
            <h1>Frequently Asked Questions</h1>
          </div>

          <div className="faqs-search-wrap">
            <input
              className="faqs-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs…"
            />
            <button className="faqs-clear" onClick={() => setSearch("")}>
              Clear
            </button>
          </div>
        </header>

        {/* Grid */}
        <section className="faqs-grid">
          {/* FAQ LIST */}
          <div className="card">
            <div className="card-head">
              <h3>FAQs</h3>
              <span className="pill">{filtered.length} results</span>
            </div>

            <div className="faq-list">
              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-title">No results found</div>
                  <div className="empty-sub">
                    Try “models”, “policy”, or “support”.
                  </div>
                </div>
              ) : (
                filtered.map((f) => {
                  const isOpen = openId === f.id;
                  return (
                    <div
                      key={f.id}
                      className={`faq-item ${isOpen ? "open" : ""}`}
                    >
                      <button
                        className="faq-q"
                        onClick={() => setOpenId(isOpen ? null : f.id)}
                        aria-expanded={isOpen}
                      >
                        <div className="faq-q-left">
                          <div className="faq-q-title">{f.question}</div>
                          {f.tag && <span className="tag">{f.tag}</span>}
                        </div>
                        <span className={`chev ${isOpen ? "open" : ""}`}>
                          ▾
                        </span>
                      </button>

                      {isOpen && <div className="faq-a">{f.answer}</div>}
                    </div>
                  );
                })
              )}
            </div>

            <div className="card-footnote">
              Add more FAQs anytime — connect API/CMS later.
            </div>
          </div>

          {/* ANALYSIS (STATIC UI DATA) */}
          <div className="card">
            <div className="card-head">
              <h3>Analysis</h3>
              <span className="pill">{periodTitle}</span>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${period === "daily" ? "active" : ""}`}
                onClick={() => setPeriod("daily")}
              >
                Daily
              </button>
              <button
                className={`tab ${period === "weekly" ? "active" : ""}`}
                onClick={() => setPeriod("weekly")}
              >
                Weekly
              </button>
              <button
                className={`tab ${period === "monthly" ? "active" : ""}`}
                onClick={() => setPeriod("monthly")}
              >
                Monthly
              </button>
            </div>

            <div className="analysis-title">
              <h4>{periodTitle} Summary</h4>
              <p>Sample dashboard metrics. Replace with backend data later.</p>
            </div>

            {/* KPI cards */}
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi-label">Total chats</div>
                <div className="kpi-value">{data.totalChats}</div>
              </div>

              <div className="kpi">
                <div className="kpi-label">Unique users</div>
                <div className="kpi-value">{data.uniqueUsers}</div>
              </div>

              <div className="kpi">
                <div className="kpi-label">Avg response</div>
                <div className="kpi-value">
                  {formatSec(data.avgResponseSec)}
                </div>
              </div>

              <div className="kpi">
                <div className="kpi-label">p95 response</div>
                <div className="kpi-value">
                  {formatSec(data.p95ResponseSec)}
                </div>
              </div>
            </div>

            {/* Panels */}
            <div className="panels">
              <div className="panel">
                <div className="panel-title">Top Questions</div>
                <ul className="list">
                  {data.topQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <div className="panel-title">Model Usage</div>

                <div className="usage">
                  <div className="usage-row">
                    <span>Trinity</span>
                    <span className="usage-right">
                      <span className="mini">{data.modelUsage.trinity}</span>
                      <span className="usage-pct">
                        {pct(data.modelUsage.trinity)}
                      </span>
                    </span>
                  </div>

                  <div className="usage-bar">
                    <div
                      className="usage-fill trinity"
                      style={{ width: pct(data.modelUsage.trinity) }}
                    />
                  </div>

                  <div className="usage-row">
                    <span>Nemotron</span>
                    <span className="usage-right">
                      <span className="mini">{data.modelUsage.nemotron}</span>
                      <span className="usage-pct">
                        {pct(data.modelUsage.nemotron)}
                      </span>
                    </span>
                  </div>

                  <div className="usage-bar">
                    <div
                      className="usage-fill nemotron"
                      style={{ width: pct(data.modelUsage.nemotron) }}
                    />
                  </div>

                  <div className="usage-row">
                    <span>Stepfun</span>
                    <span className="usage-right">
                      <span className="mini">{data.modelUsage.stepfun}</span>
                      <span className="usage-pct">
                        {pct(data.modelUsage.stepfun)}
                      </span>
                    </span>
                  </div>

                  <div className="usage-bar">
                    <div
                      className="usage-fill stepfun"
                      style={{ width: pct(data.modelUsage.stepfun) }}
                    />
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">Compliance</div>
                <div className="rows">
                  <div className="row">
                    <span className="dot warn" />
                    <span>Flagged</span>
                    <span className="mini">{data.compliance.flagged}</span>
                  </div>
                  <div className="row">
                    <span className="dot ok" />
                    <span>Safe</span>
                    <span className="mini">{data.compliance.safe}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons (UI only) */}
            <div className="actions">
              <button className="btn-primary" type="button">
                Export Report
              </button>
              <button className="btn-outline" type="button">
                View Logs
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
