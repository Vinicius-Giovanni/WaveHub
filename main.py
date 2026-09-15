
import asyncio

from backend.robot.controller.controller_ibm import _controller

if __name__ == "__main__":
    asyncio.run(_controller())