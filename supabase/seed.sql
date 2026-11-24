-- ============================================================
-- SchemeSaathi – Seed Data
-- Government Schemes Dataset (Central + Andhra Pradesh)
-- Only verified, officially-sourced scheme data
-- ============================================================

-- Departments
INSERT INTO scheme_departments (id, name, ministry, website, state) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Ministry of Agriculture & Farmers Welfare', 'Agriculture', 'https://agricoop.gov.in', 'Central'),
  ('d1000000-0000-0000-0000-000000000002', 'Ministry of Housing and Urban Affairs', 'Housing', 'https://mohua.gov.in', 'Central'),
  ('d1000000-0000-0000-0000-000000000003', 'Ministry of Education', 'Education', 'https://education.gov.in', 'Central'),
  ('d1000000-0000-0000-0000-000000000004', 'Ministry of Rural Development', 'Rural Development', 'https://rural.nic.in', 'Central'),
  ('d1000000-0000-0000-0000-000000000005', 'National Health Authority', 'Health', 'https://pmjay.gov.in', 'Central'),
  ('d1000000-0000-0000-0000-000000000006', 'Ministry of Women and Child Development', 'WCD', 'https://wcd.nic.in', 'Central'),
  ('d1000000-0000-0000-0000-000000000007', 'AP Agriculture Department', 'Agriculture', 'https://apagrisnet.ap.gov.in', 'Andhra Pradesh'),
  ('d1000000-0000-0000-0000-000000000008', 'AP School Education Department', 'Education', 'https://apschools.ap.gov.in', 'Andhra Pradesh'),
  ('d1000000-0000-0000-0000-000000000009', 'Ministry of Social Justice & Empowerment', 'Social Justice', 'https://socialjustice.gov.in', 'Central'),
  ('d1000000-0000-0000-0000-000000000010', 'Ministry of Finance', 'Finance', 'https://financialservices.gov.in', 'Central')
ON CONFLICT (name) DO NOTHING;

-- Schemes
INSERT INTO schemes (scheme_key, name, department_id, description, eligibility_summary, benefits, income_limit, required_documents, application_procedure, applicable_state, official_url, helpline, last_verified, verification_status, tags) VALUES

-- PM-KISAN
('pm-kisan', 'PM Kisan Samman Nidhi (PM-KISAN)',
  'd1000000-0000-0000-0000-000000000001',
  'Pradhan Mantri Kisan Samman Nidhi provides income support of Rs 6,000 per year to small and marginal farmer families across India, paid in three installments of Rs 2,000 each directly to their bank accounts.',
  'Farmer families owning cultivable land. Excludes income taxpayers, government employees, professionals (doctors, lawyers, etc.), and families earning over Rs 2 lakh/year.',
  'Rs 6,000 per year (3 installments of Rs 2,000 each) directly to Aadhaar-linked bank account',
  200000,
  ARRAY['Aadhaar Card', 'Land Records / Khasra-Khatauni', 'Bank Account (Aadhaar linked)', 'Mobile Number'],
  'Apply online at pmkisan.gov.in or through Common Service Centres (CSC). Farmers can self-register on the portal.',
  'All India',
  'https://pmkisan.gov.in',
  '155261',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['agriculture','central','farmer','income-support']),

-- PMAY-G
('pmay-gramin', 'Pradhan Mantri Awaas Yojana – Gramin (PMAY-G)',
  'd1000000-0000-0000-0000-000000000002',
  'PMAY-Gramin aims to provide pucca houses with basic amenities to eligible rural households. Beneficiaries are selected from SECC-2011 data and prioritized based on deprivation and exclusion criteria.',
  'Rural households from SECC-2011 beneficiary list. Priority to SC/ST, minorities, and families without shelter. Excludes households with income above Rs 3 lakh/year.',
  'Rs 1.20 lakh for plain areas; Rs 1.30 lakh for hilly/NE/IAP districts. Additional Rs 12,000 for toilet construction under SBM.',
  300000,
  ARRAY['Aadhaar Card', 'BPL Certificate or SECC ID', 'Land Ownership / No-Objection Certificate', 'Bank Account'],
  'Application through Gram Panchayat. Beneficiaries identified from SECC-2011 data. Contact your local BDO or Gram Panchayat.',
  'All India (Rural)',
  'https://pmayg.nic.in',
  '1800-11-6446',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['housing','central','rural','bpl']),

-- NSP Scholarship
('nsp-scholarship', 'National Scholarship Portal (NSP) – Pre & Post Matric Scholarships',
  'd1000000-0000-0000-0000-000000000003',
  'National Scholarship Portal provides a single platform for multiple scholarship schemes for SC, ST, OBC, Minority, and other eligible students from pre-matric through post-doctoral levels.',
  'Students from SC/ST/OBC/Minority/EWS categories enrolled in recognized institutions. Income limits vary by scheme (Rs 1 lakh to Rs 2.5 lakh/year).',
  'Rs 1,000 to Rs 20,000+ per year depending on level and category. Covers tuition fees, maintenance allowance.',
  250000,
  ARRAY['Aadhaar Card', 'Income Certificate (family)', 'Caste/Category Certificate', 'Previous Year Marksheet', 'Bonafide Certificate from Institution', 'Bank Account'],
  'Apply online at scholarships.gov.in. Fresh and renewal applications accepted annually (typically August–November). Submit through institution for verification.',
  'All India',
  'https://scholarships.gov.in',
  '0120-6619540',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['education','central','scholarship','student','sc','st','obc']),

-- IGNOAPS
('ignoaps', 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
  'd1000000-0000-0000-0000-000000000004',
  'IGNOAPS under National Social Assistance Programme (NSAP) provides monthly pension to BPL senior citizens aged 60 and above.',
  'Senior citizens aged 60+ from BPL households. Must be identified under BPL list of their respective state.',
  'Rs 500/month for age 60–79; Rs 750/month for age 80 and above (Central share). States may add additional amounts.',
  150000,
  ARRAY['Aadhaar Card', 'Age Proof (Birth Certificate, School Certificate, or Voter ID)', 'BPL Certificate / Ration Card', 'Bank Account (Aadhaar linked)'],
  'Apply at Gram Panchayat office (rural) or Ward office (urban). Submit through BDO/District Social Welfare Office.',
  'All India',
  'https://nsap.nic.in',
  NULL,
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['senior-citizen','pension','central','bpl','social-security']),

-- PM-JAY / Ayushman Bharat
('pm-jay', 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
  'd1000000-0000-0000-0000-000000000005',
  'Ayushman Bharat PM-JAY provides Rs 5 lakh per family per year health coverage for hospitalization costs at empanelled hospitals. Covers secondary and tertiary care.',
  'Families identified under SECC-2011 deprivation criteria. Covers approximately bottom 40% of Indian population by income.',
  'Up to Rs 5 lakh per family per year for hospitalization at any empanelled public or private hospital across India.',
  500000,
  ARRAY['Aadhaar Card or any PMJAY valid ID', 'SECC/Ration Card', 'Family Composition Document'],
  'No registration needed if family is in SECC list. Check eligibility at pmjay.gov.in or call helpline. Obtain Ayushman Card at any empanelled hospital or CSC.',
  'All India',
  'https://pmjay.gov.in',
  '14555',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['healthcare','central','health-insurance','bpl','hospitalization']),

-- MGNREGS
('mgnregs', 'Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS)',
  'd1000000-0000-0000-0000-000000000004',
  'MGNREGS guarantees 100 days of wage employment per financial year to every rural household whose adult members volunteer to do unskilled manual work.',
  'Any adult (18+) member of a rural household willing to do unskilled manual labour. No income or caste restriction.',
  '100 days of guaranteed employment per household per year at state-specific minimum wages (Rs 221–Rs 357/day as of 2024). Payment within 15 days via bank/post office.',
  NULL,
  ARRAY['Aadhaar Card', 'Job Card (MGNREGS) – obtained from Gram Panchayat', 'Bank Account or Post Office Account'],
  'Apply for Job Card at Gram Panchayat. Once job card issued, apply for work at the Gram Panchayat when needed. Work must be provided within 15 days of demand.',
  'All India (Rural)',
  'https://nrega.nic.in',
  '1800-345-22-44',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['employment','central','rural','labour','wage']),

-- Beti Bachao Beti Padhao / Sukanya Samriddhi
('bbbp', 'Beti Bachao Beti Padhao – Sukanya Samriddhi Yojana',
  'd1000000-0000-0000-0000-000000000006',
  'Sukanya Samriddhi Yojana under BBBP provides a small savings scheme for girl children with tax benefits and high interest rate (8.2% p.a. as of 2024), encouraging education and marriage savings.',
  'Girl child below 10 years of age. Account opened by parent/guardian at any post office or authorized bank.',
  '8.2% interest per annum (tax-free). Deposits up to Rs 1.5 lakh/year qualify for Section 80C deduction. Maturity after 21 years from account opening.',
  NULL,
  ARRAY['Birth Certificate of girl child', 'Parent/Guardian Aadhaar Card', 'Parent/Guardian PAN Card', 'Address Proof'],
  'Visit any Post Office or authorized bank (SBI, ICICI, etc.) with documents. Minimum deposit Rs 250; maximum Rs 1.5 lakh/year.',
  'All India',
  'https://wcd.nic.in/bbbp-schemes',
  NULL,
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['women','girl-child','savings','education','central']),

-- AP Rythu Bharosa
('ap-rythu-bharosa', 'YSR Rythu Bharosa – Netanna Hastham (AP)',
  'd1000000-0000-0000-0000-000000000007',
  'YSR Rythu Bharosa is an Andhra Pradesh state scheme providing investment support to farmers. When combined with PM-KISAN, AP farmers receive Rs 13,500 per year (Rs 7,500 from AP state + Rs 6,000 from PM-KISAN).',
  'Farmers in Andhra Pradesh with cultivable land. Excludes income taxpayers. Must be registered in AP state farmer database.',
  'Rs 7,500 per year from AP state (in addition to Rs 6,000 from PM-KISAN = total Rs 13,500/year). Paid in installments.',
  200000,
  ARRAY['Aadhaar Card', 'Pattadar Passbook (land records)', 'Bank Account (Aadhaar linked)', 'AP Residence Proof'],
  'Registration through Village Secretariat (Grama/Ward Sachivalayam) in Andhra Pradesh. Farmers already registered for PM-KISAN are automatically considered.',
  'Andhra Pradesh',
  'https://apagrisnet.ap.gov.in',
  '1902',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['agriculture','andhra-pradesh','farmer','income-support','state-scheme']),

-- AP Amma Vodi
('ap-amma-vodi', 'YSR Amma Vodi (AP)',
  'd1000000-0000-0000-0000-000000000008',
  'Amma Vodi is an Andhra Pradesh state scheme that provides Rs 15,000 per year directly to mothers/guardians for sending their children to school (Classes 1–12). Aimed at improving school enrolment and reducing dropout rates.',
  'Mothers or female guardians of students studying in Classes 1–12 in AP government schools. Family must be from BPL/eligible category. Father/male guardian not eligible.',
  'Rs 15,000 per year per child studying in Classes 1–12 in Andhra Pradesh government/aided schools.',
  NULL,
  ARRAY['Aadhaar Card of mother', 'Child School Enrollment Certificate', 'Bank Account (mother, Aadhaar linked)', 'AP Residence Proof (Ration Card or Voter ID)'],
  'Registration through Village Secretariat or directly at school. School principal verifies enrollment. Amount transferred to mother''s bank account.',
  'Andhra Pradesh',
  'https://ammavodi.ap.gov.in',
  '1902',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['education','andhra-pradesh','women','school','state-scheme']),

-- PM Mudra Yojana
('pm-mudra', 'Pradhan Mantri MUDRA Yojana (PMMY)',
  'd1000000-0000-0000-0000-000000000010',
  'PMMY provides loans up to Rs 10 lakh to non-corporate, non-farm small and micro enterprises through Shishu (up to Rs 50,000), Kishor (Rs 50,000–5 lakh), and Tarun (Rs 5–10 lakh) categories.',
  'Non-corporate small business owners, entrepreneurs, artisans, vendors, shopkeepers needing business loans. No collateral required for Shishu and Kishor categories.',
  'Loans of Rs 50,000 to Rs 10 lakh without collateral. Competitive interest rates. Available through banks, MFIs, NBFCs.',
  NULL,
  ARRAY['Aadhaar Card', 'PAN Card', 'Business Plan / Proposal', 'Bank Statement (6 months)', 'Address Proof of Business'],
  'Apply at any bank, NBFC, or MFI. Also available through Udyami Mitra portal (udyamimitra.in). No processing fee for Shishu loans.',
  'All India',
  'https://mudra.org.in',
  '1800-180-1111',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['business','loan','central','entrepreneur','self-employment']),

-- Atal Pension Yojana
('apy', 'Atal Pension Yojana (APY)',
  'd1000000-0000-0000-0000-000000000010',
  'Atal Pension Yojana is a government-backed pension scheme for unorganized sector workers, guaranteeing a fixed monthly pension of Rs 1,000–Rs 5,000 at age 60.',
  'Indian citizens aged 18–40 with savings bank account. Must not be an income taxpayer (from 2022). Not covered under statutory social security schemes.',
  'Guaranteed monthly pension of Rs 1,000, Rs 2,000, Rs 3,000, Rs 4,000, or Rs 5,000 at age 60 depending on contribution amount. Spouse gets pension on subscriber death.',
  NULL,
  ARRAY['Aadhaar Card', 'Savings Bank Account (Aadhaar linked)', 'Mobile Number'],
  'Apply at any bank branch where you have a savings account, or through net banking. Fill APY subscriber form and choose pension amount.',
  'All India',
  'https://npscra.nsdl.co.in/scheme-details.php',
  '1800-110-069',
  '2024-01-15',
  'OFFICIALLY_SOURCED',
  ARRAY['pension','central','unorganized-sector','retirement','savings'])

ON CONFLICT (scheme_key) DO NOTHING;

-- ============================================================
-- Sample Information Conflicts (for demo)
-- ============================================================
INSERT INTO information_conflicts (id, scheme_key, source_a_name, source_a_url, source_a_content, source_a_date, source_b_name, source_b_url, source_b_content, source_b_date, conflict_description, conflict_field, verified) VALUES
('c1000000-0000-0000-0000-000000000001',
  'pm-kisan',
  'PM-KISAN Official Portal',
  'https://pmkisan.gov.in/documents/FAQ.pdf',
  'Farmers with income above Rs 2 lakh/year who pay income tax are excluded from PM-KISAN.',
  '2023-06-01',
  'Unofficial News Report',
  'https://example-news.com/pm-kisan-income',
  'PM-KISAN is available to all farmers regardless of income.',
  '2023-04-15',
  'Income tax exclusion clause: official portal confirms income taxpayers excluded, but some unofficial sources incorrectly state no income limit.',
  'income_exclusion',
  FALSE),

('c1000000-0000-0000-0000-000000000002',
  'ap-amma-vodi',
  'AP Government Official Order',
  'https://apschools.ap.gov.in/ammavodi',
  'Amma Vodi benefit is Rs 15,000 per year per child.',
  '2024-01-01',
  'State Budget Document 2023-24',
  'https://apfinance.gov.in/budget2324',
  'Amma Vodi benefit revised to Rs 15,000 from Rs 13,000 for 2023-24.',
  '2023-03-15',
  'Historical benefit amount varies across documents. Current official rate confirmed at Rs 15,000 per child per year.',
  'benefit_amount',
  FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Sample Scheme Changes (for monitor demo)
-- ============================================================
INSERT INTO scheme_changes (scheme_key, change_field, old_value, new_value, change_description, source_url, effective_date) VALUES
('pm-kisan', 'installment_amount', '2000', '2000', 'Installment amount remains unchanged at Rs 2,000 per installment (3 per year = Rs 6,000 total)', 'https://pmkisan.gov.in', '2024-01-01'),
('apy', 'eligibility_tax', 'All citizens 18-40', 'Non-income-taxpayers 18-40 only', 'From October 2022, income taxpayers are no longer eligible to open new APY accounts', 'https://npscra.nsdl.co.in', '2022-10-01'),
('ap-amma-vodi', 'benefit_amount', '13000', '15000', 'Amma Vodi benefit increased from Rs 13,000 to Rs 15,000 per child per year from 2023-24', 'https://apschools.ap.gov.in', '2023-04-01')
ON CONFLICT DO NOTHING;
