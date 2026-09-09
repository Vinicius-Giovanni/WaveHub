from __future__ import annotations
from pathlib import Path

import os

ENV_PATH = Path(".env")

PATH_PADRAO_SHARE = Path(os.getenv('PATH_PADRAO_SHARE'))
COOKIES_FILE = Path(r'cookies.json')

TEMP_PROFILE = Path(f"{PATH_PADRAO_SHARE}/Compartilhados/WaveHub/Temporaria Profile")

TEMP_WAVEHUB = Path(f"{PATH_PADRAO_SHARE}/Compartilhados/WaveHub/Temporaria WaveHub") 

# Camada Bronze

