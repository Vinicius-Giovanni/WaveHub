
import asyncio

from backend.robot.controller.controller_ibm import _controller
from backend.robot.jobs.pipe.enrich_posicoes_ocup_vazi import EnrichPosicoesOcupVazias


if __name__ == "__main__":
    asyncio.run(_controller())
    EnrichPosicoesOcupVazias.call()