from pydantic import BaseModel, Field


class DiagnosisRequest(BaseModel):

    case_id: str | None = None

    symptom: str

    topology_note: str = ""

    show_outputs: str = ""


class DiagnosisResponse(BaseModel):

    root_cause: str = Field(
        description="Most likely root cause based only on supplied evidence."
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence from 0 to 1."
    )

    osi_layer: str = Field(
        description="Likely OSI layer involved."
    )

    evidence: list[str] = Field(
        default_factory=list,
        description="Specific evidence supporting the diagnosis."
    )

    next_command: list[str] = Field(
        default_factory=list,
        description="Cisco commands needed to obtain more evidence."
    )

    fix_steps: list[str] = Field(
        default_factory=list,
        description="Proposed remediation steps."
    )

    needs_more_evidence: bool = Field(
        description="Whether more evidence is required."
    )

    missing_evidence: list[str] = Field(
        default_factory=list,
        description="Evidence that should be collected next."
    )


class DiagnosisRecord(DiagnosisResponse):

    diagnosis_id: str
    case_id: str | None = None
    symptom: str
    rule_results: dict
    created_at: str