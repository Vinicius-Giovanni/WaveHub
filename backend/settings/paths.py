from __future__ import annotations
from pathlib import Path
from dotenv import load_dotenv

import os

ENV_PATH = Path(".env")
load_dotenv(ENV_PATH)

PATH_PADRAO_SHARE = Path(os.getenv("PATH_PADRAO"))
PATH_PADRAO_LOCAL = Path(os.getenv("PATH_PADRAO_LOCAL"))
COOKIES_FILE = Path(r'cookies.json')

TEMP_PROFILE = PATH_PADRAO_LOCAL / "playwright-profile"

TEMP_WAVEHUB = PATH_PADRAO_SHARE / "Compartilhados" / "WaveHub" / "Temporaria WaveHub"

# Camada compartilhados
OLPN_TEMP = TEMP_WAVEHUB / "3.11 - Status Wave + oLPN.csv"

# slq
SQL_DIR = Path("backend/robot/jobs/pipe/sql")