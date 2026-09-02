from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse

from backend.app.core.template import templates

router = APIRouter(
    tags=["Login"]
)

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )

@router.post("/login")
async def login_user(
    email: str = Form(...)
    ):
    
    print(f"Email recebido: {email}")

    return {
        "email": email,
    }
