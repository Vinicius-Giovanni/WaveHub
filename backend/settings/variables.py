from __future__ import annotations

from backend.settings.paths import ENV_PATH

from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=ENV_PATH)

LOGIN_ADM = os.getenv("LOGIN_ADM")
PASSWORD_ADM = os.getenv("PASSWORD_ADM")