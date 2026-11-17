import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Network,
  Database,
  ShieldCheck,
  Search,
  Copy,
  CircleHelp
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

// 1. Move styles ABOVE the component so it initializes before rendering
const styles = `
  .evidence-page {
    min-height: 100vh;
    background-color: #0b1120;
    color: #e2e8f0;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-back {
    margin-bottom: 0.5rem;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }

  .back-button:hover {
    color: #22d3ee;
  }

  .evidence-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0.5rem 0;
  }

  .header-content p {
    color: #94a3b8;
    max-width: 600px;
    margin: 0;
    line-height: 1.5;
  }

  .eyebrow {
    color: #22d3ee;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #22d3ee;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .evidence-case-id {
    background: #131d2b;
    border: 1px solid rgba(148, 163, 184, 0.15);
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 150px;
  }

  .evidence-case-id span { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
  .evidence-case-id strong { font-size: 1.25rem; color: #fff; margin: 0.25rem 0; }
  .evidence-case-id small { font-size: 0.75rem; color: #64748b; }

  .evidence-summary {
    background: linear-gradient(145deg, #131d2b 0%, #0f172a 100%);
    border: 1px solid rgba(34, 211, 238, 0.2);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  }

  .summary-icon {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .summary-main { flex: 1; }
  .summary-main span { font-size: 0.75rem; font-weight: 700; color: #f59e0b; letter-spacing: 0.05em; }
  .summary-main h2 { font-size: 1.5rem; color: #fff; margin: 0.25rem 0 0.5rem 0; }
  .summary-main p { color: #cbd5e1; margin: 0; line-height: 1.5; font-size: 0.9375rem; }

  .summary-confidence {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(34, 211, 238, 0.1);
    border-radius: 50%;
    width: 90px;
    height: 90px;
    border: 2px solid rgba(34, 211, 238, 0.3);
  }

  .summary-confidence strong { font-size: 1.75rem; color: #22d3ee; line-height: 1; }
  .summary-confidence span { font-size: 0.65rem; color: #22d3ee; text-transform: uppercase; margin-top: 0.25rem; }

  .evidence-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    .evidence-grid { grid-template-columns: 1fr 1fr; }
  }

  .evidence-card, .panel {
    background: #131d2b;
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 1rem;
    padding: 1.5rem;
  }

  .evidence-card-head, .panel-heading {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .card-icon {
    padding: 0.625rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-icon.blue { background: rgba(34, 211, 238, 0.1); color: #22d3ee; }
  .card-icon.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  .card-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  .card-icon.terminal { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
  .card-icon.gray { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

  .evidence-card-head h3, .panel-heading h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #fff;
    margin: 0 0 0.25rem 0;
  }
  .evidence-card-head p, .panel-heading p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .evidence-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .evidence-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: #0b1120;
    padding: 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.1);
    font-size: 0.875rem;
  }

  .text-emerald { color: #10b981; }
  .text-amber { color: #f59e0b; }
  .text-cyan { color: #22d3ee; }
  .text-white { color: #ffffff; }

  .status-box {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 0.75rem;
  }
  .warning-box { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: #fbbf24; }
  .success-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399; }
  
  .status-box strong { display: block; font-size: 1rem; color: #fff; margin-bottom: 0.25rem; }
  .status-box p { margin: 0; font-size: 0.875rem; opacity: 0.9; line-height: 1.4; color: inherit; }

  .command-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .command-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #000000;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    gap: 1rem;
  }

  .command-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    overflow: hidden;
  }

  .command-number {
    color: #64748b;
    font-family: monospace;
    font-size: 0.75rem;
    user-select: none;
  }

  .command-row code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: #22d3ee;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: #1e293b;
    color: #cbd5e1;
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .copy-btn:hover { background: #334155; color: #fff; }
  .copy-btn.copied { background: rgba(16, 185, 129, 0.2); color: #34d399; }

  .context-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  .context-item {
    background: #0b1120;
    border: 1px solid rgba(148, 163, 184, 0.1);
    padding: 1rem;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .context-item span { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
  .context-item strong { font-size: 1rem; color: #fff; }

  .remediation-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .remediation-list li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-left: 3px solid #10b981;
    padding: 1rem;
    border-radius: 0.5rem;
  }
  .step-number {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .remediation-list p { margin: 0; color: #e2e8f0; font-size: 0.9375rem; line-height: 1.5; }

  .similar-cases {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  .similar-case-card {
    background: #0b1120;
    border: 1px solid rgba(148, 163, 184, 0.1);
    padding: 1rem;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: transform 0.2s;
  }
  .similar-case-card:hover { transform: translateY(-2px); border-color: rgba(34, 211, 238, 0.3); }
  .similar-case-card strong { color: #22d3ee; font-size: 0.875rem; }
  .similar-case-card span { color: #cbd5e1; font-size: 0.875rem; }

  .workflow-note {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(34, 211, 238, 0.05);
    border: 1px solid rgba(34, 211, 238, 0.2);
    padding: 1rem;
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .no-evidence {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    background: #0b1120;
    border: 1px dashed rgba(148, 163, 184, 0.2);
    border-radius: 0.5rem;
    color: #64748b;
    font-size: 0.875rem;
  }

  .empty-evidence {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 2rem;
  }
  .empty-icon { color: #334155; margin-bottom: 1.5rem; }
  .empty-evidence h1 { font-size: 1.5rem; color: #fff; margin: 0 0 0.5rem 0; }
  .empty-evidence p { color: #94a3b8; max-width: 400px; margin: 0 0 2rem 0; line-height: 1.5; }
  
  .primary-button {
    background: #0891b2;
    color: #fff;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .primary-button:hover { background: #06b6d4; }
`;

function Evidence() {
  const navigate = useNavigate();
  const location = useLocation();
  const diagnosis = location.state?.diagnosis;
  const [copied, setCopied] = useState("");

  if (!diagnosis) {
    return (
      <>
        <style>{styles}</style>
        <section className="evidence-page">
          <div className="page-back">
            <button
              className="back-button"
              onClick={() => navigate("/assistant")}
            >
              <ArrowLeft size={16} />
              Back to Assistant
            </button>
          </div>
          <div className="empty-evidence">
            <CircleHelp size={48} className="empty-icon" />
            <h1>No diagnosis selected</h1>
            <p>
              Run a network diagnosis first to see evidence
              requirements and recommended commands.
            </p>
            <button
              className="primary-button"
              onClick={() => navigate("/assistant")}
            >
              Go to Assistant
            </button>
          </div>
        </section>
      </>
    );
  }

  const evidence = Array.isArray(diagnosis.evidence)
    ? diagnosis.evidence
    : [];

  const commands = Array.isArray(diagnosis.recommended_commands)
    ? diagnosis.recommended_commands
    : [];

  const remediation = Array.isArray(diagnosis.proposed_remediation)
    ? diagnosis.proposed_remediation
    : [];

  const similarCases = Array.isArray(diagnosis.similar_cases)
    ? diagnosis.similar_cases
    : [];

  const copyCommand = async (command) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch {
      setCopied("");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <section className="evidence-page">

        {/* HEADER */}
        <div className="page-back">
          <button
            className="back-button"
            onClick={() => navigate("/assistant")}
          >
            <ArrowLeft size={16} />
            Back to Diagnosis
          </button>
        </div>

        <div className="evidence-header">
          <div className="header-content">
            <div className="eyebrow">
              <span className="pulse-dot" />
              EVIDENCE WORKSPACE
            </div>
            <h1>Prove the diagnosis.</h1>
            <p>
              Review the evidence used by NetSage, identify missing information, 
              and collect additional network evidence before accepting the recommendation.
            </p>
          </div>

          <div className="evidence-case-id">
            <span>Diagnosis ID</span>
            <strong>{diagnosis.diagnosis_id || "—"}</strong>
            <small>{diagnosis.case_id || "AD-HOC"}</small>
          </div>
        </div>

        {/* DIAGNOSIS SUMMARY */}
        <div className="evidence-summary">
          <div className="summary-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="summary-main">
            <span>CURRENT HYPOTHESIS</span>
            <h2>{diagnosis.root_cause || "No root cause established"}</h2>
            <p>
              {diagnosis.diagnosis ||
                "The system could not establish a root cause from the supplied evidence."}
            </p>
          </div>
          <div className="summary-confidence">
            <strong>
              {Math.round(Number(diagnosis.confidence || 0) * 100)}%
            </strong>
            <span>confidence</span>
          </div>
        </div>

        {/* EVIDENCE STATUS GRID */}
        <div className="evidence-grid">
          {/* SUPPLIED EVIDENCE */}
          <div className="evidence-card">
            <div className="evidence-card-head">
              <div className="card-icon blue">
                <Database size={20} />
              </div>
              <div>
                <h3>Supplied Evidence</h3>
                <p>Evidence already provided to NetSage.</p>
              </div>
            </div>

            {evidence.length > 0 ? (
              <ul className="evidence-list">
                {evidence.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 size={16} className="text-emerald" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-evidence">
                <AlertTriangle size={18} />
                <span>No structured evidence was returned by the diagnosis engine.</span>
              </div>
            )}
          </div>

          {/* MISSING EVIDENCE */}
          <div className="evidence-card">
            <div className="evidence-card-head">
              <div className={`card-icon ${diagnosis.needs_more_evidence ? 'warning' : 'success'}`}>
                <Search size={20} />
              </div>
              <div>
                <h3>Evidence Requirements</h3>
                <p>Information needed to increase confidence.</p>
              </div>
            </div>

            {diagnosis.needs_more_evidence ? (
              <div className="status-box warning-box">
                <AlertTriangle size={20} />
                <div>
                  <strong>More evidence required</strong>
                  <p>NetSage does not have enough verified information to confidently establish the root cause.</p>
                </div>
              </div>
            ) : (
              <div className="status-box success-box">
                <CheckCircle2 size={20} />
                <div>
                  <strong>Evidence is sufficient</strong>
                  <p>The current evidence is sufficient for the generated hypothesis.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECOMMENDED COMMANDS */}
        <div className="panel">
          <div className="panel-heading">
            <div className="card-icon terminal">
              <Terminal size={20} />
            </div>
            <div>
              <h2>Collect More Evidence</h2>
              <p>Run these read-only commands on the affected network device.</p>
            </div>
          </div>

          {commands.length > 0 ? (
            <div className="command-list">
              {commands.map((command, index) => (
                <div className="command-row" key={index}>
                  <div className="command-left">
                    <span className="command-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <code>{command}</code>
                  </div>
                  <button
                    className={`copy-btn ${copied === command ? 'copied' : ''}`}
                    onClick={() => copyCommand(command)}
                  >
                    {copied === command ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied === command ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-evidence">
              <Terminal size={18} />
              <span>No additional commands were recommended.</span>
            </div>
          )}
        </div>

        {/* NETWORK CONTEXT */}
        <div className="panel">
          <div className="panel-heading">
            <div className="card-icon blue">
              <Network size={20} />
            </div>
            <div>
              <h2>Diagnostic Context</h2>
              <p>Network information associated with this diagnosis.</p>
            </div>
          </div>

          <div className="context-grid">
            <div className="context-item">
              <span>Category</span>
              <strong>{diagnosis.category || "Unknown"}</strong>
            </div>
            <div className="context-item">
              <span>OSI Layer</span>
              <strong>{diagnosis.osi_layer || "Not established"}</strong>
            </div>
            <div className="context-item">
              <span>Evidence Count</span>
              <strong>{evidence.length} items</strong>
            </div>
            <div className="context-item">
              <span>More Evidence</span>
              <strong className={diagnosis.needs_more_evidence ? "text-amber" : "text-emerald"}>
                {diagnosis.needs_more_evidence ? "Required" : "Not required"}
              </strong>
            </div>
          </div>
        </div>

        {/* REMEDIATION */}
        <div className="panel">
          <div className="panel-heading">
            <div className="card-icon success">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2>Proposed Remediation</h2>
              <p>Suggested corrective actions generated from the diagnosis.</p>
            </div>
          </div>

          {remediation.length > 0 ? (
            <ol className="remediation-list">
              {remediation.map((item, index) => (
                <li key={index}>
                  <div className="step-number">{index + 1}</div>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="no-evidence">
              <ShieldCheck size={18} />
              <span>No remediation was returned.</span>
            </div>
          )}
        </div>

        {/* SIMILAR CASES */}
        <div className="panel">
          <div className="panel-heading">
            <div className="card-icon gray">
              <Database size={20} />
            </div>
            <div>
              <h2>Similar Network Cases</h2>
              <p>Historical cases related to this diagnosis.</p>
            </div>
          </div>

          {similarCases.length > 0 ? (
            <div className="similar-cases">
              {similarCases.map((item, index) => {
                const id = typeof item === "string" ? item : item.case_id || `CASE-${index}`;
                const title = typeof item === "string"
                  ? "Related network case"
                  : item.title || item.description || "Related network case";

                return (
                  <div className="similar-case-card" key={id}>
                    <strong>{id}</strong>
                    <span>{title}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-evidence">
              <Database size={18} />
              <span>No similar cases found.</span>
            </div>
          )}
        </div>

        {/* RESPONSIBLE AI */}
        <div className="workflow-note">
          <ShieldCheck size={18} className="text-cyan" />
          <span>
            <strong className="text-white">Responsible AI: </strong>
            Evidence collection is read-only. NetSage never changes network configuration automatically.
          </span>
        </div>
      </section>
    </>
  );
}

export default Evidence;