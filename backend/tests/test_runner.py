import unittest
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.eligibility_engine import (
    EligibilityInput, evaluate_eligibility, evaluate_all_schemes,
    POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE,
    ADDITIONAL_INFO_REQUIRED, UNABLE_TO_VERIFY,
    check_pm_kisan, check_ignoaps, check_nsp_scholarship,
    check_ap_ysrcp_rythu_bharosa, SCHEME_RULES
)

class TestEligibilityEngine(unittest.TestCase):

    def test_pmkisan_farmer_eligible(self):
        inp = EligibilityInput(is_farmer=True, annual_income=80000, state="Andhra Pradesh")
        result = check_pm_kisan(inp)
        self.assertEqual(result.status, POTENTIALLY_ELIGIBLE)
        self.assertTrue(result.eligible)
        self.assertIsNotNone(result.benefit_estimate)

    def test_pmkisan_non_farmer_not_eligible(self):
        inp = EligibilityInput(is_farmer=False, occupation="salaried", annual_income=80000)
        result = check_pm_kisan(inp)
        self.assertEqual(result.status, NOT_ELIGIBLE)

    def test_pmkisan_income_taxpayer_excluded(self):
        inp = EligibilityInput(is_farmer=True, annual_income=300000)
        result = check_pm_kisan(inp)
        self.assertEqual(result.status, NOT_ELIGIBLE)

    def test_pmkisan_missing_info(self):
        inp = EligibilityInput(is_farmer=True)
        result = check_pm_kisan(inp)
        self.assertEqual(result.status, ADDITIONAL_INFO_REQUIRED)
        self.assertTrue(len(result.missing_info) > 0)

    def test_ignoaps_eligible_60plus(self):
        inp = EligibilityInput(age=70, annual_income=50000)
        result = check_ignoaps(inp)
        self.assertEqual(result.status, POTENTIALLY_ELIGIBLE)

    def test_ignoaps_not_eligible_young(self):
        inp = EligibilityInput(age=45, annual_income=50000)
        result = check_ignoaps(inp)
        self.assertEqual(result.status, NOT_ELIGIBLE)

    def test_ignoaps_missing_age(self):
        inp = EligibilityInput(annual_income=50000)
        result = check_ignoaps(inp)
        self.assertEqual(result.status, ADDITIONAL_INFO_REQUIRED)

    def test_nsp_student_sc_eligible(self):
        inp = EligibilityInput(is_student=True, category="SC", annual_income=100000, education="higher_secondary")
        result = check_nsp_scholarship(inp)
        self.assertEqual(result.status, POTENTIALLY_ELIGIBLE)

    def test_nsp_non_student_not_eligible(self):
        inp = EligibilityInput(is_student=False, category="SC")
        result = check_nsp_scholarship(inp)
        self.assertEqual(result.status, NOT_ELIGIBLE)

    def test_ap_rythu_bharosa_eligible(self):
        inp = EligibilityInput(is_farmer=True, state="Andhra Pradesh", annual_income=80000)
        result = check_ap_ysrcp_rythu_bharosa(inp)
        self.assertEqual(result.status, POTENTIALLY_ELIGIBLE)

    def test_ap_rythu_bharosa_wrong_state(self):
        inp = EligibilityInput(is_farmer=True, state="Maharashtra", annual_income=80000)
        result = check_ap_ysrcp_rythu_bharosa(inp)
        self.assertEqual(result.status, NOT_ELIGIBLE)

    def test_evaluate_all_returns_all_schemes(self):
        inp = EligibilityInput(age=45, is_farmer=True, state="Andhra Pradesh", annual_income=80000, category="OBC")
        results = evaluate_all_schemes(inp)
        self.assertEqual(len(results), len(SCHEME_RULES))
        for key, res in results.items():
            self.assertIn(res.status, [POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE, ADDITIONAL_INFO_REQUIRED, UNABLE_TO_VERIFY])

if __name__ == '__main__':
    unittest.main()
