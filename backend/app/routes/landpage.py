from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from backend.app.core.template import templates

router = APIRouter(
    tags=["Home"]
)

@router.get("/home", response_class=HTMLResponse)
async def landpage(request: Request):
    """
    Rota para a página inicial (landpage) da aplicação.

    Args:
        request (Request): Objeto de requisição do FastAPI.

    Returns:
        HTMLResponse: Resposta HTML renderizada com o template "index.html".
    """
    return templates.TemplateResponse(
        "landpage.html",
        {"request": request}
    )