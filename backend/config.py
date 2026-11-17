from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
PROMPTS_DIR = ROOT_DIR / "prompts"

class Settings(BaseSettings):
    APP_NAME: str = "NetSage AI"
    APP_VERSION: str = "1.1.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/netsage_ai"
    JWT_SECRET_KEY: str = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_BEFORE_DEPLOYMENT"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_MINUTES: int = 60
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 1500
    CASES_FILE: Path = DATA_DIR / "cases.csv"
    DIAGNOSES_FILE: Path = DATA_DIR / "diagnoses.json"
    REVIEWS_FILE: Path = DATA_DIR / "reviews.json"
    RESPONSIBLE_AI_FILE: Path = DATA_DIR / "responsible_ai_log.json"
    PROMPT_FILE: Path = PROMPTS_DIR / "diagnose_prompt.md"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
for directory in (DATA_DIR, PROMPTS_DIR):
    directory.mkdir(parents=True, exist_ok=True)
