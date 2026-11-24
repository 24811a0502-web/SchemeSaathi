from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from app.config import settings
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """Verify Supabase JWT and return user dict."""
    token = credentials.credentials
    try:
        client = create_client(settings.supabase_url, settings.supabase_anon_key)
        response = client.auth.get_user(token)
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        return {"id": response.user.id, "email": response.user.email, "token": token}
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """Verify user is an admin."""
    user = await get_current_user(credentials)
    from app.database import supabase_admin
    try:
        profile = supabase_admin.table("profiles").select("role").eq("id", user["id"]).single().execute()
        if not profile.data or profile.data.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

