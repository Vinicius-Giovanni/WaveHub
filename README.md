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


## 🔀 Fluxo de Branches

O projeto utiliza um fluxo de desenvolvimento baseado em branches para organizar as alterações e evitar que modificações ainda não testadas sejam enviadas diretamente para produção.

### 🌿 Branches utilizadas

| Branch             | Objetivo                                                     |
| ------------------ | ------------------------------------------------------------ |
| `feature-backend`  | Desenvolvimento das funcionalidades relacionadas ao Backend  |
| `feature-frontend` | Desenvolvimento das funcionalidades relacionadas ao Frontend |
| `dev`              | Integração e testes das funcionalidades desenvolvidas        |
| `production`       | Versão estável do projeto em produção                        |

### 🔄 Ciclo de desenvolvimento

O fluxo de desenvolvimento seguirá o seguinte ciclo:

```text
feature-backend ──┐
                  ├──> dev ──> production
feature-frontend ─┘
```

As branches `feature-backend` e `feature-frontend` são utilizadas para o desenvolvimento das funcionalidades.

Após finalizar uma alteração, deve ser aberto um **Pull Request (PR)** direcionado para a branch `dev`.

> ⚠️ As alterações não devem ser enviadas diretamente para `dev` ou `production`. O fluxo deve passar pelo Pull Request.

### 1. Desenvolvimento

Cada integrante deve trabalhar na branch correspondente à sua área:

* Backend → `feature-backend`
* Frontend → `feature-frontend`

Exemplo:

```bash
git checkout feature-backend
git pull origin feature-backend
```

Após realizar as alterações:

```bash
git add .
git commit -m "feat: adiciona autenticação de usuários"
```

### 2. Pull Request para `dev`

Depois que a implementação estiver concluída e revisada, deve ser criado um **Pull Request**:

```text
feature-backend
       ↓
      dev
```

ou

```text
feature-frontend
       ↓
      dev
```

O Pull Request deverá ser revisado e aprovado antes de ser integrado à `dev`.

### 3. Testes na `dev`

A branch `dev` funciona como ambiente de **integração e validação**.

Periodicamente, as funcionalidades aprovadas serão integradas à `dev` e serão realizados testes para verificar se:

* As novas funcionalidades estão funcionando corretamente;
* O Backend e o Frontend estão funcionando em conjunto;
* Não existem erros ou regressões;
* As alterações não quebraram funcionalidades existentes.

Caso sejam encontrados problemas, eles deverão ser corrigidos nas respectivas branches de desenvolvimento e posteriormente enviados novamente para `dev através de um novo Pull Request.

### 4. Pull Request para `production`

Quando todas as funcionalidades presentes em `dev` estiverem testadas e funcionando corretamente, será criado um Pull Request de:

```text
dev
 ↓
production
```

Após a aprovação e o merge, a branch `production` passará a conter a versão considerada **estável e pronta para produção**.

---

### 📌 Resumo do ciclo

O ciclo completo será:

```text
┌──────────────────┐
│ Desenvolvimento  │
│                  │
│ feature-backend  │
│ feature-frontend │
└────────┬─────────┘
         │
         │ Pull Request
         ▼
┌──────────────────┐
│       dev        │
│                  │
│ Integração       │
│ + Testes         │
└────────┬─────────┘
         │
         │ Pull Request
         │ após aprovação
         ▼
┌──────────────────┐
│   production     │
│                  │
│ Versão estável   │
└──────────────────┘
```

**Em resumo:** desenvolvemos nas branches de `feature`, enviamos as alterações para `dev` através de Pull Requests, realizamos os testes de integração em `dev` e, estando tudo funcionando corretamente, enviamos `dev` para `production` através de um novo Pull Request.
