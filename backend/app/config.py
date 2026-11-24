from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # Gemini
    gemini_api_key: str

    # Security
    secret_key: str = "changeme-at-least-32-chars-long!!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Rate limiting
    rate_limit_per_minute: int = 60

    # File upload
    max_file_size_mb: int = 10
    allowed_extensions: str = "pdf,jpg,jpeg,png"

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

