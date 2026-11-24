from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.database import supabase_admin
from app.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(data: SignUpRequest):
    try:
        response = supabase_admin.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {"full_name": data.full_name}
        })
        user = response.user
        # Create profile
        supabase_admin.table("profiles").insert({
            "id": user.id,
            "email": data.email,
            "full_name": data.full_name,
            "role": "user"
        }).execute()
        return {"message": "Account created successfully", "user_id": user.id}
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(data: LoginRequest):
    try:
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_anon_key)
        response = client.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": response.user.user_metadata.get("full_name", "")
            }
        }
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    try:
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_anon_key)
        response = client.auth.refresh_session(refresh_token)
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token refresh failed")

