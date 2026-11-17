import {
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Zap
} from "lucide-react";


function DiagnosisPanel({
  cases,
  selectedCase,
  setSelectedCase,
  form,
  setForm,
  loading,
  onDiagnose
}) {


  function updateField(field, value) {

    setForm(prev => ({
      ...prev,
      [field]: value
    }));

  }


  return (

    <div className="panel input-panel">

      <div className="panel-head">

        <div className="panel-heading">

          <span className="step-number">
            01
          </span>

          <div>

            <h2>
              Describe the incident
            </h2>

            <p>
              Give NetSage enough evidence
              to reason safely.
            </p>

          </div>

        </div>

      </div>


      <div className="form-content">


        {/* CASE */}

        <label>
          LOAD A LAB CASE
          <span>
            OPTIONAL
          </span>
        </label>


        <select
          value={selectedCase}
          onChange={(event) =>
            setSelectedCase(
              event.target.value
            )
          }
          disabled={loading}
        >

          <option value="">
            Start from scratch
          </option>


          {cases.map((caseItem, index) => {

            const id =
              caseItem.case_id ||
              caseItem.id ||
              `CASE-${index + 1}`;


            const title =
              caseItem.title ||
              caseItem.description ||
              "Network case";


            return (

              <option
                key={id}
                value={id}
              >

                {id}
                {" · "}
                {title}

              </option>

            );

          })}

        </select>


        {/* SYMPTOM */}

        <label>
          SYMPTOM
          <em>*</em>
        </label>


        <textarea

          className="symptom-input"

          value={
            form?.symptom || ""
          }

          onChange={(event) =>
            updateField(
              "symptom",
              event.target.value
            )
          }

          placeholder={
            "Example: PC receives an IP address but cannot reach the default gateway."
          }

          disabled={loading}

        />


        {/* TOPOLOGY */}

        <label>
          TOPOLOGY / CONTEXT
        </label>


        <textarea

          value={
            form?.topology_note || ""
          }

          onChange={(event) =>
            updateField(
              "topology_note",
              event.target.value
            )
          }

          placeholder={
            "PC1 → SW-ACCESS-01 → SW-CORE-01 → Gateway\nVLAN 20 is the client network..."
          }

          disabled={loading}

        />


        {/* COMMAND OUTPUT */}

        <label>
          SHOW COMMAND OUTPUT
        </label>


        <textarea

          className="terminal-input"

          value={
            form?.show_outputs || ""
          }

          onChange={(event) =>
            updateField(
              "show_outputs",
              event.target.value
            )
          }

          placeholder={
            "Paste Cisco output here...\n\nshow interfaces trunk\nshow vlan brief\nshow ip route"
          }

          disabled={loading}

        />


        {/* BUTTON */}

        <button

          className="primary-button"

          onClick={onDiagnose}

          disabled={
            loading ||
            !form?.symptom?.trim()
          }

        >

          {loading ? (

            <>

              <RefreshCw
                size={17}
                className="spin"
              />

              Analyzing evidence...

            </>

          ) : (

            <>

              <Zap size={17} />

              Run diagnosis

              <ArrowRight size={17} />

            </>

          )}

        </button>


        <div className="safe-note">

          <ShieldCheck size={14} />

          No network configuration is changed
          by NetSage.

        </div>

      </div>

    </div>

  );

}


export default DiagnosisPanel;