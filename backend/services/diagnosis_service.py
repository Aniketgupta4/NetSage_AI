from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.rules.checker import run_all_checks
from backend.services.ai_service import generate_diagnosis
from backend.config import settings


ROOT_DIR = Path(__file__).resolve().parents[2]
CASES_FILE = settings.CASES_FILE
DIAGNOSES_FILE = settings.DIAGNOSES_FILE


# ---------------------------------------------------------
# Historical cases
# ---------------------------------------------------------

def load_cases() -> list[dict[str, Any]]:
    import csv

    if not CASES_FILE.exists():
        return []

    with open(
        CASES_FILE,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.DictReader(file)

        return [
            {key: value.strip() if isinstance(value, str) else value
             for key, value in row.items()}
            for row in reader
        ]


# ---------------------------------------------------------
# Text similarity
# ---------------------------------------------------------

def tokenize(text: str) -> set[str]:
    if not text:
        return set()

    return set(
        re.findall(
            r"[a-zA-Z0-9_.:/-]+",
            text.lower()
        )
    )


def similarity_score(
    current_text: str,
    historical_text: str
) -> float:

    current = tokenize(current_text)
    historical = tokenize(historical_text)

    if not current or not historical:
        return 0.0

    intersection = current.intersection(historical)
    union = current.union(historical)

    if not union:
        return 0.0

    return round(
        len(intersection) / len(union),
        3
    )


def find_similar_cases(
    symptom: str,
    topology: str,
    command_output: str,
    limit: int = 5
) -> list[dict[str, Any]]:

    cases = load_cases()

    current_text = " ".join([
        symptom,
        topology,
        command_output
    ])

    matches = []

    for case in cases:

        historical_text = " ".join([
            str(case.get("title", "")),
            str(case.get("symptom", case.get("issue", ""))),
            str(case.get("description", "")),
            str(case.get("concept", case.get("expected_category", ""))),
            str(case.get("expected_fault", case.get("expected_root_cause", ""))),
        ])

        score = similarity_score(
            current_text,
            historical_text
        )

        if score > 0:
            matches.append({
                **case,
                "similarity": score
            })

    matches.sort(
        key=lambda x: x["similarity"],
        reverse=True
    )

    return matches[:limit]


# ---------------------------------------------------------
# Deterministic evidence extraction
# ---------------------------------------------------------

def extract_vlan(command_output: str, topology: str) -> str | None:
    text = f"{topology}\n{command_output}"
    patterns = [r"\bvlan\s+(\d+)\b", r"\bvlan(\d+)\b"]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def _expand_vlan_list(value: str) -> list[str]:
    result: list[str] = []
    for token in re.split(r"[,\s]+", value.strip()):
        if not token:
            continue
        if re.fullmatch(r"\d+-\d+", token):
            first, last = map(int, token.split("-"))
            if 1 <= first <= last <= 4094 and last - first <= 4094:
                result.extend(str(v) for v in range(first, last + 1))
        elif token.isdigit() and 1 <= int(token) <= 4094:
            result.append(token)
    return list(dict.fromkeys(result))


def extract_allowed_vlans(command_output: str) -> list[str]:
    lines = command_output.splitlines()
    for index, line in enumerate(lines):
        if "vlans allowed on trunk" in line.lower() or "vlan allowed on trunk" in line.lower():
            # Cisco output normally puts the VLAN list on the next non-empty line.
            for candidate in lines[index + 1:index + 4]:
                candidate = candidate.strip()
                if candidate:
                    values = _expand_vlan_list(candidate)
                    if values:
                        return values
    # Also support compact evidence such as "allowed vlan 10,20,30".
    match = re.search(r"allowed\s+vlans?\s*[:=]?\s*([0-9,\s-]+)", command_output, re.IGNORECASE)
    return _expand_vlan_list(match.group(1)) if match else []


def deterministic_vlan_check(symptom: str, topology: str, command_output: str) -> dict[str, Any]:
    vlan = extract_vlan(f"{symptom}\n{command_output}", topology)
    allowed = extract_allowed_vlans(command_output)
    evidence = []
    if vlan:
        evidence.append(f"VLAN {vlan} is referenced by the incident.")
    if allowed:
        evidence.append(f"Trunk allowed VLANs: {', '.join(allowed)}.")
    if vlan and allowed and vlan not in allowed:
        return {
            "matched": True,
            "category": "VLAN",
            "root_cause": f"VLAN {vlan} is not present in the supplied trunk allowed-VLAN list.",
            "confidence": 0.90,
            "osi_layer": "Layer 2 — Data Link",
            "evidence": evidence + [f"VLAN {vlan} is absent from the allowed VLAN list."],
            "recommended_commands": ["show interfaces trunk", "show interfaces Gi0/1 switchport", "show vlan brief"],
            "proposed_remediation": [f"Verify that VLAN {vlan} should traverse the trunk.", f"If confirmed, permit VLAN {vlan} on the relevant trunk interface."],
        }
    return {"matched": False, "category": "Unknown", "root_cause": None, "confidence": 0.0,
            "osi_layer": None, "evidence": evidence, "recommended_commands": [], "proposed_remediation": []}


# ---------------------------------------------------------
# Main diagnosis pipeline
# ---------------------------------------------------------

async def diagnose_network_issue(
    case_id: str,
    symptom: str,
    topology: str,
    command_output: str,
    device: str = "",
    device_type: str = "",
    severity: str = "Medium"
) -> dict[str, Any]:

    diagnosis_id = f"DGN-{uuid.uuid4().hex[:8].upper()}"

    # 1. Historical comparison
    similar_cases = find_similar_cases(
        symptom=symptom,
        topology=topology,
        command_output=command_output
    )

    # 2. Deterministic rules
    rule_result = deterministic_vlan_check(
        symptom=symptom,
        topology=topology,
        command_output=command_output
    )

    # 3. Run complete rule engine
    try:
        rule_findings = run_all_checks(
            symptom=symptom,
            context=topology,
            command_output=command_output
        )
    except Exception:
        rule_findings = []

    # 4. Build evidence package
    evidence_package = {
        "incident": {
            "case_id": case_id,
            "symptom": symptom,
            "topology": topology,
            "command_output": command_output,
            "device": device,
            "device_type": device_type,
            "severity": severity
        },

        "deterministic_analysis": rule_result,

        "rule_engine_findings": rule_findings,

        "similar_historical_cases": similar_cases
    }

    # 5. Ask Gemini to synthesize the report
    try:

        ai_result = await generate_diagnosis(
            evidence_package
        )

    except Exception as exc:

        ai_result = {
            "ai_available": False,
            "error": str(exc)
        }

    # 6. Deterministic result remains authoritative
    primary_finding = rule_findings[0] if rule_findings else {}
    rule_fallback_cause = primary_finding.get("finding")
    root_cause = (
        rule_result.get("root_cause")
        or rule_fallback_cause
        or ai_result.get("root_cause")
        or "Insufficient evidence to establish a root cause"
    )

    confidence = max(
        float(rule_result.get("confidence", 0) or 0),
        float(ai_result.get("confidence", 0) or 0),
        0.55 if rule_fallback_cause else 0.0
    )

    category = (
        rule_result.get("category") if rule_result.get("matched") else None
    ) or primary_finding.get("category") or ai_result.get("category") or "Unknown"

    osi_layer = (
        rule_result.get("osi_layer")
        or ai_result.get("osi_layer")
        or ("Layer 2 — Data Link" if category.lower() in {"vlan", "interface"} else None)
        or ("Layer 3 — Network" if category.lower() in {"ip", "routing"} else None)
    )

    evidence = list(dict.fromkeys(
        rule_result.get("evidence", [])
        + [str(item.get("evidence", item.get("finding", ""))) for item in rule_findings if item.get("evidence") or item.get("finding")]
        + ai_result.get("evidence", [])
    ))

    recommended_commands = (
        rule_result.get("recommended_commands", [])
        or [command for item in rule_findings for command in item.get("recommendation", [])]
        or ai_result.get("recommended_commands", [])
    )

    proposed_remediation = (
        rule_result.get("proposed_remediation", [])
        or [item.get("finding") for item in rule_findings if item.get("finding")]
        or ai_result.get("proposed_remediation", [])
    )

    # 7. Final frontend-safe response
    result = {
        "diagnosis_id": diagnosis_id,
        "case_id": case_id,

        "status": "RESULT_READY",

        "category": category,

        "root_cause": root_cause,

        "diagnosis": root_cause,

        "confidence": round(confidence, 2),

        "confidence_percent": round(
            confidence * 100
        ),

        "osi_layer": osi_layer,

        "evidence": evidence,

        "more_evidence_required": (
            confidence < 0.75 or not command_output.strip()
        ),

        "recommended_commands":
            recommended_commands,

        "proposed_remediation":
            proposed_remediation,

        "similar_cases": similar_cases,

        "ai_analysis": ai_result,
        "rule_findings": rule_findings,

        "human_review_required": True,

        "created_at":
            datetime.now(timezone.utc).isoformat(),

        "responsible_ai": {
            "rules_run_before_ai": True,
            "historical_cases_used": True,
            "human_review_required": True,
            "automatic_configuration_change": False
        }
    }

    save_diagnosis(result)

    return result


# ---------------------------------------------------------
# Save diagnosis
# ---------------------------------------------------------

def save_diagnosis(result: dict[str, Any]) -> None:

    existing = []

    if DIAGNOSES_FILE.exists():

        try:

            with open(
                DIAGNOSES_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                existing = json.load(file)

                if not isinstance(existing, list):
                    existing = []

        except Exception:
            existing = []

    existing.append(result)

    with open(
        DIAGNOSES_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            existing,
            file,
            indent=2,
            ensure_ascii=False
        )