import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings
import backend.services.diagnosis_service as diagnosis_service

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "REVIEWS_FILE", tmp_path / "reviews.json")
    monkeypatch.setattr(settings, "RESPONSIBLE_AI_FILE", tmp_path / "responsible_ai_log.json")
    monkeypatch.setattr(diagnosis_service, "DIAGNOSES_FILE", tmp_path / "diagnoses.json")
    async def no_ai(_evidence):
        return {"ai_available": False, "mode": "test_rules_only"}
    monkeypatch.setattr(diagnosis_service, "generate_diagnosis", no_ai)
    return TestClient(app)

def test_health_and_core_routes(client):
    assert client.get('/health').status_code == 200
    cases = client.get('/api/cases')
    assert cases.status_code == 200
    assert cases.json()['count'] >= 25
    assert client.get('/api/dashboard').status_code == 200
    assert client.get('/api/reviews').status_code == 200

def test_vlan_diagnosis_and_review_flow(client):
    response = client.post('/api/diagnosis', json={
        'case_id': 'TEST',
        'symptom': 'VLAN 20 users cannot reach gateway',
        'topology': 'PC -> SW-ACCESS -> SW-CORE',
        'command_output': 'Port Mode Status\nGi0/1 on trunking\nVlans allowed on trunk\n10,30,40'
    })
    assert response.status_code == 200
    result = response.json()
    assert result['category'] == 'VLAN'
    assert 'VLAN 20' in result['root_cause']
    assert result['human_review_required'] is True
    review = client.post('/api/reviews', json={
        'case_id': 'TEST', 'diagnosis_id': result['diagnosis_id'],
        'decision': 'ACCEPTED', 'reviewer_comment': 'Reviewed'
    })
    assert review.status_code == 200
    assert client.get('/api/reviews').json()['count'] == 1
    assert client.get('/api/dashboard').json()['review_count'] == 1

def test_non_vlan_rule_engine_findings(client):
    cases = [
        ('Duplicate IP detected', 'ip'),
        ('Uplink interface is down', 'interface'),
        ('Remote network unreachable', 'routing'),
    ]
    for symptom, expected_category in cases:
        response = client.post('/api/diagnosis', json={
            'case_id': 'RULE-TEST', 'symptom': symptom,
            'topology': '', 'command_output': 'show ip route: no route to network' if expected_category == 'routing' else 'GigabitEthernet0/24 is administratively down' if expected_category == 'interface' else ''
        })
        assert response.status_code == 200
        result = response.json()
        assert result['category'] == expected_category
        assert result['rule_findings']
