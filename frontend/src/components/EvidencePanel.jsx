import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Code2,
  FileSearch,
  GitCompare,
  Layers3,
  Terminal,
  Wrench,
  Brain,
  Database,
  ShieldCheck
} from "lucide-react";

function EvidencePanel({ diagnosis }) {

  if (!diagnosis) {
    return (
      <div className="evidence-empty">
        <FileSearch size={30} />

        <h3>Diagnosis evidence</h3>

        <p>
          Run a diagnosis to see deterministic checks,
          AI reasoning, recommended commands,
          remediation, and similar historical cases.
        </p>
      </div>
    );
  }

  /* =========================================
     NORMALIZE API DATA
  ========================================= */

  const evidence = Array.isArray(diagnosis.evidence)
    ? diagnosis.evidence
    : [];

  const commands = Array.isArray(diagnosis.recommended_commands)
    ? diagnosis.recommended_commands
    : Array.isArray(diagnosis.recommendedCommands)
      ? diagnosis.recommendedCommands
      : [];

  const remediation = Array.isArray(diagnosis.proposed_remediation)
    ? diagnosis.proposed_remediation
    : [];

  const similarCases = Array.isArray(diagnosis.similar_cases)
    ? diagnosis.similar_cases
    : [];

  const moreEvidence =
    Boolean(
      diagnosis.more_evidence_required ??
      diagnosis.needs_more_evidence
    );

  const confidence = Math.round(
    Number(diagnosis.confidence ?? 0) * 100
  );

  const aiAnalysis = diagnosis.ai_analysis || {};

  /* =========================================
     HELPERS
  ========================================= */

  function getEvidenceText(item) {
    if (typeof item === "string") {
      return item;
    }

    if (item?.description) {
      return item.description;
    }

    if (item?.text) {
      return item.text;
    }

    return JSON.stringify(item);
  }

  function getCaseTitle(item) {
    if (typeof item === "string") {
      return "Related network case";
    }

    return (
      item?.title ||
      item?.expected_fault ||
      "Related network case"
    );
  }

  function getCaseId(item, index) {
    if (typeof item === "string") {
      return item;
    }

    return (
      item?.case_id ||
      item?.id ||
      `CASE-${index + 1}`
    );
  }

  function getSimilarity(item) {
    if (
      typeof item === "object" &&
      item?.similarity !== undefined
    ) {
      return Math.round(
        Number(item.similarity) * 100
      );
    }

    return null;
  }

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="evidence-workspace">

      {/* =====================================
          1. EVIDENCE SUMMARY
      ===================================== */}

      <section className="evidence-section evidence-summary">

        <div className="section-heading">

          <div className="section-icon blue">
            <Activity size={17} />
          </div>

          <div>
            <h3>Evidence summary</h3>

            <p>
              Deterministic findings extracted from the supplied incident data.
            </p>
          </div>

        </div>


        <div className="evidence-stat-grid">

          <div className="evidence-stat">

            <Layers3 size={18} />

            <span>OSI layer</span>

            <strong>
              {diagnosis.osi_layer || "Not established"}
            </strong>

          </div>


          <div className="evidence-stat">

            <FileSearch size={18} />

            <span>Evidence items</span>

            <strong>
              {evidence.length}
            </strong>

          </div>


          <div className="evidence-stat">

            <Code2 size={18} />

            <span>Commands</span>

            <strong>
              {commands.length}
            </strong>

          </div>


          <div className="evidence-stat">

            <GitCompare size={18} />

            <span>Similar cases</span>

            <strong>
              {similarCases.length}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================
          2. SUPPORTING EVIDENCE
      ===================================== */}

      <section className="evidence-section">

        <div className="section-heading">

          <div className="section-icon green">
            <CheckCircle2 size={17} />
          </div>

          <div>
            <h3>Evidence supporting the hypothesis</h3>

            <p>
              Observations that support the identified root cause.
            </p>
          </div>

        </div>


        {evidence.length > 0 ? (

          <div className="evidence-list">

            {evidence.map((item, index) => (

              <div
                className="evidence-item"
                key={index}
              >

                <div className="evidence-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="evidence-item-content">

                  <strong>
                    Finding {index + 1}
                  </strong>

                  <p>
                    {getEvidenceText(item)}
                  </p>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-result">
            <AlertCircle size={17} />

            <span>
              No structured evidence returned.
            </span>
          </div>

        )}

      </section>


      {/* =====================================
          3. EVIDENCE SUFFICIENCY
      ===================================== */}

      <section
        className={
          moreEvidence
            ? "evidence-status-card warning"
            : "evidence-status-card success"
        }
      >

        <div className="status-icon">

          {moreEvidence ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}

        </div>


        <div className="status-content">

          <strong>
            {moreEvidence
              ? "More evidence required"
              : "Evidence sufficient"}
          </strong>

          <p>

            {moreEvidence
              ? "The current evidence is insufficient to establish the root cause. Collect the recommended command output before accepting the diagnosis."
              : "The supplied evidence is sufficient to support the current diagnosis."}

          </p>

        </div>

      </section>


      {/* =====================================
          4. RECOMMENDED COMMANDS
      ===================================== */}

      <section className="evidence-section">

        <div className="section-heading">

          <div className="section-icon purple">
            <Terminal size={17} />
          </div>

          <div>
            <h3>Recommended next commands</h3>

            <p>
              Commands that can verify the diagnosis.
            </p>
          </div>

        </div>


        {commands.length > 0 ? (

          <div className="command-list">

            {commands.map((command, index) => (

              <div
                className="command-item"
                key={index}
              >

                <span className="command-number">
                  {index + 1}
                </span>

                <Code2 size={15} />

                <code>
                  {command}
                </code>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-result">
            <Terminal size={17} />

            <span>
              No commands recommended.
            </span>
          </div>

        )}

      </section>


      {/* =====================================
          5. PROPOSED REMEDIATION
      ===================================== */}

      <section className="evidence-section">

        <div className="section-heading">

          <div className="section-icon orange">
            <Wrench size={17} />
          </div>

          <div>
            <h3>Proposed remediation</h3>

            <p>
              Suggested corrective actions. NetSage does not execute them automatically.
            </p>
          </div>

        </div>


        {remediation.length > 0 ? (

          <div className="remediation-list">

            {remediation.map((item, index) => (

              <div
                className="remediation-item"
                key={index}
              >

                <div className="remediation-number">
                  {index + 1}
                </div>

                <p>
                  {typeof item === "string"
                    ? item
                    : item?.description ||
                      item?.text ||
                      JSON.stringify(item)}
                </p>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-result">
            <Wrench size={17} />

            <span>
              No remediation returned.
            </span>
          </div>

        )}

      </section>


      {/* =====================================
          6. SIMILAR HISTORICAL CASES
      ===================================== */}

      <section className="evidence-section">

        <div className="section-heading">

          <div className="section-icon cyan">
            <Database size={17} />
          </div>

          <div>
            <h3>Similar historical cases</h3>

            <p>
              Previously stored network incidents used as supporting context.
            </p>
          </div>

        </div>


        {similarCases.length > 0 ? (

          <div className="similar-case-list">

            {similarCases.map((item, index) => {

              const caseId =
                getCaseId(item, index);

              const title =
                getCaseTitle(item);

              const similarity =
                getSimilarity(item);

              return (

                <div
                  className="similar-case"
                  key={`${caseId}-${index}`}
                >

                  <div className="similar-case-left">

                    <div className="case-icon">
                      <GitCompare size={16} />
                    </div>

                    <div>

                      <strong>
                        {caseId}
                      </strong>

                      <span>
                        {title}
                      </span>

                    </div>

                  </div>


                  {similarity !== null && (

                    <div className="similarity-score">

                      <strong>
                        {similarity}%
                      </strong>

                      <span>
                        similarity
                      </span>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        ) : (

          <div className="empty-result">
            <Database size={17} />

            <span>
              No similar cases found.
            </span>
          </div>

        )}

      </section>


      {/* =====================================
          7. AI ANALYSIS
      ===================================== */}

      <section className="evidence-section ai-analysis-section">

        <div className="section-heading">

          <div className="section-icon ai">
            <Brain size={17} />
          </div>

          <div>
            <h3>AI reasoning</h3>

            <p>
              AI analysis is kept separate from deterministic evidence.
            </p>
          </div>

        </div>


        <div className="ai-analysis-card">

          <div className="ai-analysis-row">

            <span>AI availability</span>

            <strong
              className={
                aiAnalysis.ai_available
                  ? "ai-online"
                  : "ai-offline"
              }
            >
              {aiAnalysis.ai_available
                ? "Available"
                : "Unavailable"}
            </strong>

          </div>


          {aiAnalysis.error && (

            <div className="ai-error">

              <AlertCircle size={16} />

              <span>
                {aiAnalysis.error}
              </span>

            </div>

          )}

        </div>

      </section>


      {/* =====================================
          8. DIAGNOSIS METADATA
      ===================================== */}

      <section className="evidence-section metadata-section">

        <div className="section-heading">

          <div className="section-icon gray">
            <ShieldCheck size={17} />
          </div>

          <div>
            <h3>Diagnosis metadata</h3>

            <p>
              Traceability information for this diagnosis.
            </p>
          </div>

        </div>


        <div className="metadata-grid">

          <div>
            <span>Diagnosis ID</span>
            <strong>
              {diagnosis.diagnosis_id || "—"}
            </strong>
          </div>

          <div>
            <span>Case ID</span>
            <strong>
              {diagnosis.case_id || "—"}
            </strong>
          </div>

          <div>
            <span>Category</span>
            <strong>
              {diagnosis.category || "—"}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              {diagnosis.status || "—"}
            </strong>
          </div>

          <div>
            <span>Confidence</span>
            <strong>
              {confidence}%
            </strong>
          </div>

        </div>

      </section>

    </div>
  );
}

export default EvidencePanel;