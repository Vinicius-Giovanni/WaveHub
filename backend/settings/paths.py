from __future__ import annotations
from pathlib import Path
import os
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve.parents[2] / ".env"

COOKIES_FILE = Path(r'cookies.json')