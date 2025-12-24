# from pydantic_settings import BaseSettings

# class Settings(BaseSettings):
#     # App
#     SECRET_KEY: str = "supersecretkey123" # Change this!
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60 # 30 days

#     # Database
#     DATABASE_URL: str
#     DB_NAME: str = "rupeeriser"

#     # Azure OpenAI
#     AZURE_OPENAI_API_KEY: str
#     AZURE_OPENAI_ENDPOINT: str
#     AZURE_OPENAI_API_VERSION: str = "2023-05-15"
#     AZURE_OPENAI_DEPLOYMENT: str  # e.g., "gpt-35-turbo" or "gpt-4"

#     class Config:
#         env_file = ".env"

# settings = Settings()
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    SECRET_KEY: str = "supersecretkey123" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60 

    # Database
    DATABASE_URL: str
    DB_NAME: str = "rupeeriser"

    # Google Gemini (Free)
    GOOGLE_API_KEY: str

    class Config:
        env_file = ".env"
        extra = "ignore"  # <--- ADD THIS LINE to stop the error

settings = Settings()