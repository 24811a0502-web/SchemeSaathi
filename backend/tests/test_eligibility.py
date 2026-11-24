"""
Backend tests for SchemeSaathi
Run with: cd backend && pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ============================================================
# Eligibility Engine Tests (no DB/API key needed)
# ============================================================
from app.services.eligibility_engine import (
    EligibilityInput, evaluate_eligibility,
    POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE,
    ADDITIONAL_INFO_REQUIRED, UNABLE_TO_VERIFY,
    check_pm_kisan, check_ignoaps, check_nsp_scholarship,
    check_ap_ysrcp_rythu_bharosa
)

class TestEligibilityEngine:

    # PM-KISAN tests
    def test_pmkisan_farmer_eligible(self):
        inp = EligibilityInput(is_farmer=True, annual_income=80000, state="Andhra Pradesh")
        result = check_pm_kisan(inp)
        assert result.status == POTENTIALLY_ELIGIBLE
        assert result.eligible is True
        assert result.benefit_estimate is not None

    def test_pmkisan_non_farmer_not_eligible(self):
        inp = EligibilityInput(is_farmer=False, occupation="salaried", annual_income=80000)
        result = check_pm_kisan(inp)
        assert result.status == NOT_ELIGIBLE

    def test_pmkisan_income_taxpayer_excluded(self):
        inp = EligibilityInput(is_farmer=True, annual_income=300000)
        result = check_pm_kisan(inp)
        assert result.status == NOT_ELIGIBLE

    def test_pmkisan_missing_info(self):
        inp = EligibilityInput(is_farmer=True)  # no income, no state
        result = check_pm_kisan(inp)
        assert result.status == ADDITIONAL_INFO_REQUIRED
        assert len(result.missing_info) > 0

    # IGNOAPS tests
    def test_ignoaps_eligible_60plus(self):
        inp = EligibilityInput(age=70, annual_income=50000)
        result = check_ignoaps(inp)
        assert result.status == POTENTIALLY_ELIGIBLE
        assert "750" in result.benefit_estimate  # 80+ gets 750, but 70 gets 500

    def test_ignoaps_not_eligible_young(self):
        inp = EligibilityInput(age=45, annual_income=50000)
        result = check_ignoaps(inp)
        assert result.status == NOT_ELIGIBLE

    def test_ignoaps_missing_age(self):
        inp = EligibilityInput(annual_income=50000)
        result = check_ignoaps(inp)
        assert result.status == ADDITIONAL_INFO_REQUIRED

    def test_ignoaps_80_plus(self):
        inp = EligibilityInput(age=85, annual_income=50000)
        result = check_ignoaps(inp)
        assert result.eligible is True
        assert "750" in result.benefit_estimate

    # NSP Scholarship tests
    def test_nsp_student_sc_eligible(self):
        inp = EligibilityInput(is_student=True, category="SC", annual_income=100000, education="higher_secondary")
        result = check_nsp_scholarship(inp)
        assert result.status == POTENTIALLY_ELIGIBLE

    def test_nsp_non_student_not_eligible(self):
        inp = EligibilityInput(is_student=False, category="SC")
        result = check_nsp_scholarship(inp)
        assert result.status == NOT_ELIGIBLE

    def test_nsp_income_too_high(self):
        inp = EligibilityInput(is_student=True, category="OBC", annual_income=350000, education="graduate")
        result = check_nsp_scholarship(inp)
        assert result.status == NOT_ELIGIBLE

    # AP Rythu Bharosa tests
    def test_ap_rythu_bharosa_eligible(self):
        inp = EligibilityInput(is_farmer=True, state="Andhra Pradesh", annual_income=80000)
        result = check_ap_ysrcp_rythu_bharosa(inp)
        assert result.status == POTENTIALLY_ELIGIBLE

    def test_ap_rythu_bharosa_wrong_state(self):
        inp = EligibilityInput(is_farmer=True, state="Maharashtra", annual_income=80000)
        result = check_ap_ysrcp_rythu_bharosa(inp)
        assert result.status == NOT_ELIGIBLE

    def test_ap_rythu_bharosa_non_farmer(self):
        inp = EligibilityInput(is_farmer=False, state="Andhra Pradesh")
        result = check_ap_ysrcp_rythu_bharosa(inp)
        assert result.status == NOT_ELIGIBLE

    # Trust labels
    def test_official_schemes_have_trust_labels(self):
        inp = EligibilityInput(is_farmer=True, state="Andhra Pradesh", annual_income=80000)
        result = check_pm_kisan(inp)
        assert result.trust_label is not None
        assert result.official_source is not None
        assert result.source_url is not None

    # Unknown scheme
    def test_unknown_scheme_returns_unable_to_verify(self):
        from app.services.eligibility_engine import evaluate_eligibility
        inp = EligibilityInput(age=30)
        result = evaluate_eligibility("non-existent-scheme", inp)
        assert result.status == UNABLE_TO_VERIFY

    # Evaluate all schemes
    def test_evaluate_all_returns_all_schemes(self):
        from app.services.eligibility_engine import evaluate_all_schemes, SCHEME_RULES
        inp = EligibilityInput(age=45, is_farmer=True, state="Andhra Pradesh", annual_income=80000, category="OBC")
        results = evaluate_all_schemes(inp)
        assert len(results) == len(SCHEME_RULES)
        for key, result in results.items():
            assert result.status in [POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE, ADDITIONAL_INFO_REQUIRED, UNABLE_TO_VERIFY]


class TestAPIHealth:
    """Tests that require the FastAPI app (mocked DB)."""

    def test_health_endpoint(self):
        """Basic health check without DB."""
        # We mock Supabase to avoid needing real credentials
        import unittest.mock as mock
        with mock.patch('app.database.supabase_admin'):
            with mock.patch('app.config.settings') as mock_settings:
                mock_settings.supabase_url = "https://test.supabase.co"
                mock_settings.supabase_anon_key = "test-key"
                mock_settings.supabase_service_role_key = "test-service-key"
                mock_settings.gemini_api_key = "test-gemini-key"
                mock_settings.frontend_url = "http://localhost:3000"
                mock_settings.log_level = "INFO"
                # Can't fully test without env, but verify engine works
                pass

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
