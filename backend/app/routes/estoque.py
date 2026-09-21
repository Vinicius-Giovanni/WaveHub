from fastapi import APIRouter, Request, Response
from fastapi.responses import HTMLResponse

import json

from backend.settings.paths import ESTOQUE_3D_JSON, LAYOUT_ESTOQUE_3D
from backend.app.core.template import templates

router = APIRouter(
    tags=['Estoque']
)

@router.get("/api/layout")
async def get_layout(response: Response):
    response.headers['Cache-Control'] = "public, max-age=604800"
    with open(LAYOUT_ESTOQUE_3D, 'r', encoding='utf-8') as file:
        return json.load(file)
    

@router.get("/api/estoque")
async def get_estoque():
    with open(ESTOQUE_3D_JSON, 'r', encoding='utf-8') as file:
        return json.load(file)

@router.get("/estoque", response_class=HTMLResponse)
async def estoque(request: Request):
    """
    Rota para a página de estoque da aplicação.

    Args:
        request (Request): Objeto de requisição do FastAPI.

    Returns:
        HTMLResponse: Resposta HTML renderizada com o template "estoque.html".
    """

    return templates.TemplateResponse(
        request=request,
        name="estoque.html",
    )