from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Anon client (for user-scoped operations using user JWT)
def get_supabase_anon() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)

# Service role client (for admin/server-side operations, never exposed to frontend)
def get_supabase_admin() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

supabase_admin: Client = get_supabase_admin()

