# Criação da aplicação através do FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

from backend.app.routes.login import router as login_router

def create_app() -> FastAPI:
    """
    Cria e retorna uma instância da aplicação FastAPI.

    Returns:
        FastAPI: Instância da aplicação FastAPI.
    """
    app = FastAPI(title="WaveHub", version="1.0.0")
    
    # Aqui você pode adicionar rotas, middlewares, etc.
    
    # Configuração frontend static
    app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

    #rotas
    app.include_router(login_router)
    
    return app