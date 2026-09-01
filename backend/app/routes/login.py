from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(
    prefix="/login",
    tag=["Login"]
)

#Definir pasta de templates para o Jinja2
templates = Jinja2Templates(directory="./frontend/templates")

@router.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request}
    )

@router.post("/")
async def login_user(email: str = Form(...)):
    print(f"Email recebido: {email}")

    return {
        "email": email,
    }
