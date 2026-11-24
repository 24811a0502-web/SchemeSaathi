from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth import get_current_user
from app.database import supabase_admin
from app.services.eligibility_engine import EligibilityInput, evaluate_all_schemes
import logging
import uuid
from datetime import datetime
import io

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate")
async def generate_report(user: dict = Depends(get_current_user)):
    """Generate a comprehensive PDF report for the user."""
    # Gather all data
    profile_res = supabase_admin.table("profiles").select("*").eq("id", user["id"]).single().execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = profile_res.data

    family_res = supabase_admin.table("family_members").select("*").eq("user_id", user["id"]).execute()
    family = family_res.data or []

    journeys_res = supabase_admin.table("user_scheme_journeys").select("*").eq("user_id", user["id"]).execute()
    journeys = journeys_res.data or []

    schemes_res = supabase_admin.table("schemes").select("*").eq("is_active", True).execute()
    scheme_meta = {s["scheme_key"]: s for s in (schemes_res.data or [])}

    # Run eligibility for user
    user_input = EligibilityInput(
        age=profile.get("age"),
        gender=profile.get("gender"),
        state=profile.get("state"),
        annual_income=profile.get("annual_income"),
        occupation=profile.get("occupation"),
        category=profile.get("category"),
        is_farmer=profile.get("is_farmer", False),
        is_student=profile.get("is_student", False),
    )
    eligibility_results = evaluate_all_schemes(user_input)
    eligible = {k: r for k, r in eligibility_results.items() if r.eligible}

    # Generate PDF using ReportLab
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import HexColor, white, black
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.units import inch, cm
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()
    navy = HexColor('#0F172A')
    cyan = HexColor('#06B6D4')
    green = HexColor('#10B981')

    story = []

    # Title
    title_style = ParagraphStyle('Title', parent=styles['Title'], textColor=navy, fontSize=20, spaceAfter=6)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], textColor=cyan, fontSize=11, spaceAfter=12)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], textColor=navy, fontSize=14, spaceBefore=16, spaceAfter=6)
    normal_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, spaceAfter=4)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, textColor=HexColor('#6B7280'))

    story.append(Paragraph("SchemeSaathi", title_style))
    story.append(Paragraph("Personal Government Scheme Report", subtitle_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%d %B %Y at %H:%M UTC')}", small_style))
    story.append(HRFlowable(width="100%", thickness=1, color=cyan))
    story.append(Spacer(1, 0.3*inch))

    # User Profile
    story.append(Paragraph("User Profile", heading_style))
    profile_data = [
        ["Name", profile.get("full_name", "N/A")],
        ["Age", str(profile.get("age", "N/A"))],
        ["State", profile.get("state", "N/A")],
        ["Occupation", profile.get("occupation", "N/A")],
        ["Annual Income", f"Rs {profile.get('annual_income', 0):,.0f}" if profile.get("annual_income") else "N/A"],
        ["Category", profile.get("category", "N/A")],
    ]
    t = Table(profile_data, colWidths=[4*cm, 10*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0,0), (0,-1), navy),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.2*inch))

    # Family Members
    if family:
        story.append(Paragraph(f"Family Members ({len(family)})", heading_style))
        fam_data = [["Name", "Relation", "Age", "Occupation"]]
        for m in family:
            demo_tag = " [DEMO]" if m.get("is_demo") else ""
            fam_data.append([m.get("name","") + demo_tag, m.get("relation",""), str(m.get("age","")), m.get("occupation","") or "N/A"])
        ft = Table(fam_data, colWidths=[5*cm, 4*cm, 2.5*cm, 5*cm])
        ft.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), navy),
            ('TEXTCOLOR', (0,0), (-1,0), white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('GRID', (0,0), (-1,-1), 0.5, HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, HexColor('#F8FAFC')]),
        ]))
        story.append(ft)
        story.append(Spacer(1, 0.2*inch))

    # Eligible Schemes
    story.append(Paragraph(f"Potentially Eligible Schemes ({len(eligible)})", heading_style))
    story.append(Paragraph("⚠️ These are preliminary results based on your profile. Official eligibility is determined by government officials.", small_style))
    story.append(Spacer(1, 0.1*inch))

    for key, result in eligible.items():
        meta = scheme_meta.get(key, {})
        story.append(Paragraph(f"✓ {meta.get('name', key)}", ParagraphStyle('SchemeTitle', parent=normal_style, textColor=green, fontName='Helvetica-Bold')))
        if result.benefit_estimate:
            story.append(Paragraph(f"   Benefit: {result.benefit_estimate}", normal_style))
        if meta.get("official_url"):
            story.append(Paragraph(f"   Apply at: {meta.get('official_url')}", small_style))
        if result.required_documents:
            story.append(Paragraph(f"   Documents: {', '.join(result.required_documents)}", small_style))
        story.append(Paragraph(f"   Source: {meta.get('verification_status','UNVERIFIED')} | Verified: {meta.get('last_verified','N/A')}", small_style))
        story.append(Spacer(1, 0.1*inch))

    # Journey Status
    if journeys:
        story.append(Paragraph(f"Application Journey Status ({len(journeys)} schemes)", heading_style))
        journey_data = [["Scheme", "Current Stage", "Last Updated"]]
        for j in journeys:
            journey_data.append([j.get("scheme_name",""), j.get("current_stage",""), j.get("updated_at","")[:10]])
        jt = Table(journey_data, colWidths=[7*cm, 5*cm, 4.5*cm])
        jt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), navy),
            ('TEXTCOLOR', (0,0), (-1,0), white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('GRID', (0,0), (-1,-1), 0.5, HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(jt)
        story.append(Spacer(1, 0.2*inch))

    # Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor('#CBD5E1')))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("DISCLAIMER", ParagraphStyle('Disclaimer', parent=small_style, fontName='Helvetica-Bold')))
    story.append(Paragraph(
        "This report is generated by SchemeSaathi AI for informational purposes only. Eligibility results are preliminary and based on the profile data provided. "
        "Official eligibility is determined solely by the respective government departments. "
        "Verify all information at official government portals before applying. "
        "SchemeSaathi does not guarantee application approval or rejection.",
        small_style
    ))

    doc.build(story)
    buffer.seek(0)

    # Save record
    report_id = str(uuid.uuid4())
    try:
        supabase_admin.table("citizen_reports").insert({
            "id": report_id,
            "user_id": user["id"],
            "report_type": "scheme_match",
            "title": f"Scheme Report – {datetime.utcnow().strftime('%d %b %Y')}",
            "content": {
                "eligible_count": len(eligible),
                "family_size": len(family),
                "generated_at": datetime.utcnow().isoformat(),
            },
        }).execute()
    except Exception as e:
        logger.warning(f"Could not save report record: {e}")

    from fastapi.responses import Response
    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=SchemeSaathi_Report_{datetime.utcnow().strftime('%Y%m%d')}.pdf"}
    )

@router.get("/my-reports")
async def get_my_reports(user: dict = Depends(get_current_user)):
    result = supabase_admin.table("citizen_reports").select("*").eq("user_id", user["id"]).order("generated_at", desc=True).execute()
    return result.data or []
