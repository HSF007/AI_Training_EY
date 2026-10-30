from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CineStream API"

    database_url: str = (
        "postgresql+psycopg://postgre:"
        "Admin@123@localhost:5432/cinestream"
    )

    frontend_origin: str = "http://localhost:5173"

    jwt_secret: str = "aAsAJ2QaGNXH1II68rNa3K2HU4JGZ3HEx2xd1G5HWcysh9kT75nUOKxbYNTGHQlt"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 15
    jwt_issuer: str = "cinestream-api"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    media_root: str = "media"
    api_public_base_url: str = "http://127.0.0.1:8000"
    playback_token_minutes: int = 30
    playback_audience: str = "cinestream-playback"


settings = Settings()