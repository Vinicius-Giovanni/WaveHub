# 🌊 WaveHub

Sistema web para monitoramento e visualização de indicadores atuais e históricos dos diferentes setores da operação.

## 📌 Sobre o projeto

O **WaveHub** será uma aplicação web hospedada por meio do **Cloudflare Tunnel (cloudflared)** e executada diretamente no servidor.

A aplicação terá como objetivo centralizar e apresentar informações e indicadores de diferentes setores, permitindo a visualização de dados atuais e históricos.

O **backend** será responsável pela extração dos relatórios, tratamento e transformação dos dados por meio de pipelines, consolidação das informações e criação de arquivos com dados resumidos para consumo do frontend.

O **frontend** será responsável por consumir esses dados e apresentar as informações de forma simples e visual ao usuário.

## 🛠️ Stack

### Backend

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
</p>

### Frontend

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
</p>

### Infraestrutura

<p>
  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare"/>
</p>

## 🏗️ Arquitetura

```text
                  ┌──────────────────┐
                  │    Relatórios    │
                  │      Origem      │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │    Pipelines     │
                  │     Python       │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Dados Tratados  │
                  │  e Consolidados  │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │     FastAPI      │
                  │     Backend      │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │     Frontend     │
                  │    HTML + CSS    │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │      Usuário     │
                  └──────────────────┘
```

## 🎯 Objetivo

Criar uma plataforma centralizada para acompanhamento dos indicadores operacionais, facilitando a consulta de informações atuais e históricas e reduzindo a necessidade de acesso manual aos relatórios de origem.

## 🚧 Status

**Em desenvolvimento.**


---

## Anotações

```
Execução local

uv run uvicorn backend.app.main:app --reload
```