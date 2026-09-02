from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse

from backend.app.core.template import templates

router = APIRouter(
    prefix="/login",
    tags=["Login"]
)

@router.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

@router.post("/")
async def login_user(
    email: str = Form(...)
    ):
    
    print(f"Email recebido: {email}")

    return {
        "email": email,
    }
