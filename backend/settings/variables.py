from __future__ import annotations

from settings.paths import ENV_PATH

from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=ENV_PATH)

LINK_LOGIN = os.getenv()