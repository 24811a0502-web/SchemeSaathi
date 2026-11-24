"""
Deterministic Eligibility Rule Engine
======================================
Evaluates scheme eligibility based on hard rules.
Gemini may explain results but NEVER overrides this engine.

Returns one of:
  - POTENTIALLY_ELIGIBLE
  - NOT_ELIGIBLE
  - ADDITIONAL_INFO_REQUIRED
  - UNABLE_TO_VERIFY
"""
from typing import Optional
from dataclasses import dataclass, field

POTENTIALLY_ELIGIBLE = "POTENTIALLY_ELIGIBLE"
NOT_ELIGIBLE = "NOT_ELIGIBLE"
ADDITIONAL_INFO_REQUIRED = "ADDITIONAL_INFO_REQUIRED"
UNABLE_TO_VERIFY = "UNABLE_TO_VERIFY"

@dataclass
class EligibilityInput:
    age: Optional[int] = None
    gender: Optional[str] = None  # male/female/other
    state: Optional[str] = None
    district: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None  # farmer/student/salaried/self_employed/homemaker/retired/unemployed
    education: Optional[str] = None  # primary/secondary/higher_secondary/graduate/postgraduate/none
    family_size: Optional[int] = None
    category: Optional[str] = None  # SC/ST/OBC/General/EWS
    is_farmer: bool = False
    is_student: bool = False
    has_disability: bool = False
    relation: Optional[str] = None  # for family member context

@dataclass
class EligibilityResult:
    status: str
    eligible: bool
    reasons: list = field(default_factory=list)
    missing_info: list = field(default_factory=list)
    benefit_estimate: Optional[str] = None
    required_documents: list = field(default_factory=list)
    restrictions: list = field(default_factory=list)
    official_source: Optional[str] = None
    source_url: Optional[str] = None
    last_verified: Optional[str] = None
    trust_label: str = "Verified Against Available Official Evidence"

def check_pm_kisan(inp: EligibilityInput) -> EligibilityResult:
    """PM-KISAN: Rs 6000/year for small/marginal farmer families."""
    missing = []
    reasons = []
    restrictions = []

    if inp.is_farmer is False and inp.occupation != "farmer":
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Applicant must be a farmer/cultivator"],
            official_source="PM-KISAN Official Portal",
            source_url="https://pmkisan.gov.in",
            last_verified="2024-01-01",
            trust_label="Officially Sourced"
        )

    if inp.state is None:
        missing.append("State of residence")
    if inp.annual_income is None:
        missing.append("Annual family income")

    # Exclusion criteria
    if inp.occupation in ["government_employee", "retired_government"]:
        restrictions.append("Former/current central/state government employees are excluded")
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=restrictions,
            official_source="PM-KISAN Official Portal",
            source_url="https://pmkisan.gov.in",
            last_verified="2024-01-01"
        )

    if inp.annual_income and inp.annual_income > 200000:
        restrictions.append("Income taxpayers are excluded from PM-KISAN")
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=restrictions,
            official_source="PM-KISAN Official Portal",
            source_url="https://pmkisan.gov.in",
            last_verified="2024-01-01"
        )

    if missing:
        return EligibilityResult(
            status=ADDITIONAL_INFO_REQUIRED, eligible=False,
            missing_info=missing,
            official_source="PM-KISAN Official Portal",
            source_url="https://pmkisan.gov.in",
            last_verified="2024-01-01"
        )

    reasons.append("Is a farmer/cultivator family")
    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=reasons,
        benefit_estimate="Rs 6,000 per year (Rs 2,000 per installment, 3 installments)",
        required_documents=["Aadhaar Card", "Land Records/Khasra-Khatauni", "Bank Account Details", "Mobile Number"],
        official_source="PM-KISAN Official Portal",
        source_url="https://pmkisan.gov.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_pmay_gramin(inp: EligibilityInput) -> EligibilityResult:
    """PMAY-G: Housing for rural poor."""
    missing = []
    if inp.state is None:
        missing.append("State")
    if inp.annual_income is None:
        missing.append("Annual income")

    if inp.annual_income and inp.annual_income > 300000:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Annual income exceeds Rs 3,00,000 limit for PMAY-Gramin"],
            official_source="PMAY-G Official Portal",
            source_url="https://pmayg.nic.in",
            last_verified="2024-01-01"
        )

    if missing:
        return EligibilityResult(
            status=ADDITIONAL_INFO_REQUIRED, eligible=False,
            missing_info=missing,
            official_source="PMAY-G Official Portal",
            source_url="https://pmayg.nic.in",
            last_verified="2024-01-01"
        )

    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=["Rural household with income within limits"],
        benefit_estimate="Up to Rs 1.20 lakh (plain areas) or Rs 1.30 lakh (hilly/difficult areas) for house construction",
        required_documents=["Aadhaar Card", "BPL Certificate", "Land Ownership Documents", "Bank Account"],
        official_source="PMAY-G Official Portal",
        source_url="https://pmayg.nic.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_nsp_scholarship(inp: EligibilityInput) -> EligibilityResult:
    """National Scholarship Portal – pre/post-matric scholarships for SC/ST/OBC/minorities."""
    if not inp.is_student and inp.occupation != "student":
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Must be an enrolled student"],
            official_source="National Scholarship Portal",
            source_url="https://scholarships.gov.in",
            last_verified="2024-01-01"
        )

    missing = []
    if inp.category is None:
        missing.append("Social category (SC/ST/OBC/General/Minority)")
    if inp.annual_income is None:
        missing.append("Family annual income")
    if inp.education is None:
        missing.append("Current education level")

    if missing:
        return EligibilityResult(
            status=ADDITIONAL_INFO_REQUIRED, eligible=False,
            missing_info=missing,
            official_source="National Scholarship Portal",
            source_url="https://scholarships.gov.in",
            last_verified="2024-01-01"
        )

    eligible_categories = ["SC", "ST", "OBC", "EWS"]
    if inp.category not in eligible_categories:
        if inp.annual_income and inp.annual_income > 250000:
            return EligibilityResult(
                status=NOT_ELIGIBLE, eligible=False,
                reasons=["General category with income above Rs 2.5 lakh is not eligible for most NSP scholarships"],
                official_source="National Scholarship Portal",
                source_url="https://scholarships.gov.in",
                last_verified="2024-01-01"
            )

    income_limit = 250000 if inp.category in ["SC", "ST"] else 200000
    if inp.annual_income and inp.annual_income > income_limit:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=[f"Family income Rs {inp.annual_income:,.0f} exceeds the limit of Rs {income_limit:,} for {inp.category} scholarship"],
            official_source="National Scholarship Portal",
            source_url="https://scholarships.gov.in",
            last_verified="2024-01-01"
        )

    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=[f"Student from {inp.category} category with income within limits"],
        benefit_estimate="Varies by scholarship scheme (Rs 1,000–Rs 20,000+ per year depending on level and category)",
        required_documents=["Aadhaar Card", "Income Certificate", "Caste Certificate", "Marksheets", "Bank Account", "Institution Bonafide Certificate"],
        official_source="National Scholarship Portal",
        source_url="https://scholarships.gov.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_ignoaps(inp: EligibilityInput) -> EligibilityResult:
    """Indira Gandhi National Old Age Pension Scheme (IGNOAPS)."""
    if inp.age is None:
        return EligibilityResult(
            status=ADDITIONAL_INFO_REQUIRED, eligible=False,
            missing_info=["Age of applicant"],
            official_source="NSAP – Ministry of Rural Development",
            source_url="https://nsap.nic.in",
            last_verified="2024-01-01"
        )

    if inp.age < 60:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=[f"Minimum age is 60 years; applicant is {inp.age}"],
            official_source="NSAP – Ministry of Rural Development",
            source_url="https://nsap.nic.in",
            last_verified="2024-01-01"
        )

    if inp.annual_income and inp.annual_income > 150000:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Must belong to BPL household; income appears above BPL threshold"],
            official_source="NSAP – Ministry of Rural Development",
            source_url="https://nsap.nic.in",
            last_verified="2024-01-01"
        )

    amount = "Rs 500/month (age 60–79), Rs 750/month (age 80+)"
    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=[f"Senior citizen aged {inp.age} from BPL household"],
        benefit_estimate=amount,
        required_documents=["Aadhaar Card", "Age Proof", "BPL Certificate", "Bank Account"],
        official_source="NSAP – Ministry of Rural Development",
        source_url="https://nsap.nic.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_ap_ysrcp_rythu_bharosa(inp: EligibilityInput) -> EligibilityResult:
    """AP YSR Rythu Bharosa – Rs 13,500/year for AP farmers."""
    if inp.state and inp.state.upper() not in ["ANDHRA PRADESH", "AP"]:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["YSR Rythu Bharosa is an Andhra Pradesh state scheme; applicant must be from AP"],
            official_source="AP Government – Agriculture Department",
            source_url="https://apagrisnet.ap.gov.in",
            last_verified="2024-01-01"
        )

    if not inp.is_farmer and inp.occupation != "farmer":
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Must be a farmer/cultivator in Andhra Pradesh"],
            official_source="AP Government – Agriculture Department",
            source_url="https://apagrisnet.ap.gov.in",
            last_verified="2024-01-01"
        )

    missing = []
    if inp.state is None:
        missing.append("State (must be Andhra Pradesh)")
    if missing:
        return EligibilityResult(
            status=ADDITIONAL_INFO_REQUIRED, eligible=False,
            missing_info=missing,
            official_source="AP Government – Agriculture Department",
            source_url="https://apagrisnet.ap.gov.in",
            last_verified="2024-01-01"
        )

    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=["AP farmer qualifying for YSR Rythu Bharosa investment support"],
        benefit_estimate="Rs 13,500 per year (Rs 7,500 from AP state + Rs 6,000 from PM-KISAN)",
        required_documents=["Aadhaar Card", "Land Records (Pattadar Passbook)", "Bank Account", "AP Residence Proof"],
        official_source="AP Government – Agriculture Department",
        source_url="https://apagrisnet.ap.gov.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_ap_amma_vodi(inp: EligibilityInput) -> EligibilityResult:
    """AP Amma Vodi – Rs 15,000/year for mothers sending children to school."""
    if inp.state and inp.state.upper() not in ["ANDHRA PRADESH", "AP"]:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Amma Vodi is an Andhra Pradesh state scheme"],
            official_source="AP School Education Department",
            source_url="https://ammavodi.ap.gov.in",
            last_verified="2024-01-01"
        )

    if inp.gender and inp.gender.lower() != "female":
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Amma Vodi is for mothers (female guardians) only"],
            official_source="AP School Education Department",
            source_url="https://ammavodi.ap.gov.in",
            last_verified="2024-01-01"
        )

    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=["Mother in AP household with school-going child"],
        benefit_estimate="Rs 15,000 per year per child attending school (Classes 1–12)",
        required_documents=["Aadhaar Card", "Child's School Enrollment Certificate", "Bank Account (Aadhaar linked)", "AP Residence Proof"],
        official_source="AP School Education Department",
        source_url="https://ammavodi.ap.gov.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_pmjay(inp: EligibilityInput) -> EligibilityResult:
    """Ayushman Bharat PM-JAY – Rs 5 lakh health cover for poor families."""
    missing = []
    if inp.annual_income is None:
        missing.append("Annual family income")
    if inp.state is None:
        missing.append("State")

    if missing:
        return EligibilityResult(
            status=ADDITIONAL_INFO_REQUIRED, eligible=False,
            missing_info=missing,
            official_source="Ayushman Bharat – NHA",
            source_url="https://pmjay.gov.in",
            last_verified="2024-01-01"
        )

    if inp.annual_income and inp.annual_income > 500000:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["PM-JAY targets SECC-identified households; high income families are generally excluded"],
            official_source="Ayushman Bharat – NHA",
            source_url="https://pmjay.gov.in",
            last_verified="2024-01-01"
        )

    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=["Low-income household potentially qualifying under SECC criteria"],
        benefit_estimate="Up to Rs 5 lakh per family per year for hospitalization",
        required_documents=["Aadhaar Card", "SECC/Ration Card", "Family ID"],
        official_source="Ayushman Bharat – NHA",
        source_url="https://pmjay.gov.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_bbbp(inp: EligibilityInput) -> EligibilityResult:
    """Beti Bachao Beti Padhao – awareness + conditional benefits for girl children."""
    if inp.gender and inp.gender.lower() != "female":
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Beti Bachao Beti Padhao primarily benefits girl children/families with daughters"],
            official_source="Ministry of Women and Child Development",
            source_url="https://wcd.nic.in/bbbp-schemes",
            last_verified="2024-01-01"
        )

    if inp.age and inp.age > 10:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["BBBP Sukanya Samriddhi component is for girls below 10 years"],
            official_source="Ministry of Women and Child Development",
            source_url="https://wcd.nic.in/bbbp-schemes",
            last_verified="2024-01-01"
        )

    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=["Girl child eligible for Sukanya Samriddhi Yojana under BBBP"],
        benefit_estimate="Sukanya Samriddhi: 8.2% interest on deposits up to Rs 1.5 lakh/year (tax-free maturity)",
        required_documents=["Birth Certificate of girl child", "Parent Aadhaar Card", "Bank Account"],
        official_source="Ministry of Women and Child Development",
        source_url="https://wcd.nic.in/bbbp-schemes",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )

def check_mnregs(inp: EligibilityInput) -> EligibilityResult:
    """MGNREGS – 100 days guaranteed wage employment for rural households."""
    if inp.state is None:
        return EligibilityResult(
            status=ADDITIONAL_INFO_REQUIRED, eligible=False,
            missing_info=["State (must be rural area)"],
            official_source="Ministry of Rural Development – MGNREGS",
            source_url="https://nrega.nic.in",
            last_verified="2024-01-01"
        )
    if inp.age and inp.age < 18:
        return EligibilityResult(
            status=NOT_ELIGIBLE, eligible=False,
            reasons=["Minimum age for MGNREGS work is 18 years"],
            official_source="Ministry of Rural Development – MGNREGS",
            source_url="https://nrega.nic.in",
            last_verified="2024-01-01"
        )
    return EligibilityResult(
        status=POTENTIALLY_ELIGIBLE, eligible=True,
        reasons=["Adult rural household member eligible for 100 days of guaranteed employment"],
        benefit_estimate=f"State-specific daily wage (Rs 221–Rs 357 per day, 100 days per household per year)",
        required_documents=["Aadhaar Card", "Job Card (MGNREGS)", "Bank Account"],
        official_source="Ministry of Rural Development – MGNREGS",
        source_url="https://nrega.nic.in",
        last_verified="2024-01-01",
        trust_label="Officially Sourced"
    )


# Registry of all scheme rule functions
SCHEME_RULES: dict = {
    "pm-kisan": check_pm_kisan,
    "pmay-gramin": check_pmay_gramin,
    "nsp-scholarship": check_nsp_scholarship,
    "ignoaps": check_ignoaps,
    "ap-rythu-bharosa": check_ap_ysrcp_rythu_bharosa,
    "ap-amma-vodi": check_ap_amma_vodi,
    "pm-jay": check_pmjay,
    "bbbp": check_bbbp,
    "mgnregs": check_mnregs,
}

def evaluate_eligibility(scheme_key: str, profile: EligibilityInput) -> EligibilityResult:
    rule_fn = SCHEME_RULES.get(scheme_key)
    if rule_fn is None:
        return EligibilityResult(
            status=UNABLE_TO_VERIFY, eligible=False,
            reasons=["No deterministic rule defined for this scheme"],
            trust_label="Unverified"
        )
    return rule_fn(profile)

def evaluate_all_schemes(profile: EligibilityInput) -> dict:
    """Run all scheme rules and return results keyed by scheme_key."""
    return {key: evaluate_eligibility(key, profile) for key in SCHEME_RULES}

