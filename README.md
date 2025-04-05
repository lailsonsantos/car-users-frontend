# Car Users Fullstack App 🚗👤

Aplicação Fullstack com **Angular + Spring Boot**, que permite login, cadastro de usuários e gerenciamento de carros pessoais.

---

## ✅ ESTÓRIAS DE USUÁRIO

1. Eu, como usuário, desejo me autenticar com login e senha para acessar a aplicação.
2. Eu, como usuário, desejo cadastrar minha conta com nome, e-mail, login e senha.
3. Eu, como usuário, desejo cadastrar meu(s) carro(s), informando placa, modelo e marca.
4. Eu, como usuário, desejo editar e excluir meus carros existentes.
5. Eu, como usuário, desejo visualizar meus dados pessoais e informações de login.
6. Eu, como sistema, desejo impedir cadastros com campos vazios ou inválidos.
7. Eu, como sistema, desejo validar e-mails e logins únicos para evitar duplicações.
8. Eu, como sistema, desejo proteger todas as rotas com autenticação via token JWT.
9. Eu, como usuário, desejo mensagens de erro padronizadas em JSON para facilitar entendimento.
10. Eu, como desenvolvedor, desejo rodar e testar o projeto localmente com Docker.
11. Eu, como devops, desejo realizar o deploy automatizado da aplicação no Heroku.
12. Eu, como desenvolvedor, desejo acessar a documentação da API via Swagger.

---

## 💡 SOLUÇÃO

A aplicação foi dividida em dois projetos: **Frontend Angular** e **Backend Spring Boot**. A seguir estão os pontos técnicos adotados:

### 🔐 Segurança

- JWT Token via `Authorization: Bearer` para autenticação.
- Rotas protegidas com AuthGuard no Angular e Spring Security no backend.
- Expiração e renovação de token tratadas.

### 🧱 Estrutura

- Backend com Spring Boot 3, Maven, e banco de dados H2 para persistência.
- Frontend com Angular 15+ usando Angular Material, Reactive Forms e Interceptor de token.
- Documentação da API via Swagger disponível em `/swagger-ui.html`.

---

## ❗ Erros e Rotas da API

### 🔐 Autenticação e Usuários

| URL | Descrição | Códigos de erro |
|-----|-----------|-----------------|
| `/api/signin` | Espera `login` e `password`, retorna JWT com informações do usuário logado | 1 |
| `/api/users` | Cadastrar novo usuário | 2, 3, 4, 5 |
| `/api/users/{id}` | Atualizar usuário pelo ID | 2, 3, 4, 5 |

**Erros possíveis:**
- **1**: Login inexistente ou senha inválida → `"Invalid login or password"`
- **2**: E-mail já existente → `"Email already exists"`
- **3**: Login já existente → `"Login already exists"`
- **4**: Campos inválidos → `"Invalid fields"`
- **5**: Campos não preenchidos → `"Missing fields"`

---

### 👤 Perfil e Carros

| URL | Descrição | Códigos de erro |
|-----|-----------|-----------------|
| `/api/me` | Retorna dados do usuário logado, como nome, email, carros, `createdAt` e `lastLogin` | 1, 2 |
| `/api/cars` | Listar todos os carros do usuário logado | 1, 2 |
| `/api/cars` | Cadastrar novo carro | 1, 2, 3, 4, 5 |
| `/api/cars/{id}` | Buscar carro por ID | 1, 2 |
| `/api/cars/{id}` | Remover carro por ID | 1, 2 |
| `/api/cars/{id}` | Atualizar carro por ID | 1, 2, 3, 4, 5 |

**Erros possíveis:**
- **1**: Token não enviado → `"Unauthorized"`
- **2**: Token expirado → `"Unauthorized - invalid session"`
- **3**: Placa já existente → `"License plate already exists"`
- **4**: Campos inválidos → `"Invalid fields"`
- **5**: Campos não preenchidos → `"Missing fields"`

---

## 🔀 ROTAS DA API

### 🔐 Autenticação
- `POST /api/signin` → Login do usuário

### 👤 Usuários
- `POST /api/users` → Cadastro
- `PUT /api/users/{id}` → Atualização
- `GET /api/me` → Dados do usuário logado

### 🚗 Carros
- `GET /api/cars` → Listar carros
- `POST /api/cars` → Criar carro
- `GET /api/cars/{id}` → Buscar por ID
- `PUT /api/cars/{id}` → Atualizar
- `DELETE /api/cars/{id}` → Excluir

---

## 🚀 COMO EXECUTAR O PROJETO

### ⚙️ Requisitos
- Java 17
- Node.js 18+
- Angular CLI
- Maven
- Docker (opcional)

### 🖥️ Rodando localmente sem Docker

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
ng serve

# Acesse: http://localhost:4200
```

---

## 🐳 EXECUTANDO COM DOCKER

```bash
# Construir e subir o projeto
docker compose up --build

# Frontend disponível em: http://localhost:4201
# Backend disponível em: http://localhost:8080
```

---

## ☁️ DEPLOY NO HEROKU

### 🔧 FRONTEND

```bash
# Acesse a pasta raiz do frontend
cd frontend

# Login no Heroku
heroku login

# Crie o app
heroku create nome-do-app-frontend

# Set buildpack para Node.js
heroku buildpacks:set heroku/nodejs

# Envie o código
git push heroku main

# Abra o app
heroku open
```

### 🔧 BACKEND

```bash
cd backend

heroku create nome-do-app-backend
heroku buildpacks:set heroku/java
git push heroku main
```

---

## 🧪 TESTES

### ✅ Frontend (Angular)
```bash
cd frontend
ng test
```

### ✅ Backend (Spring Boot)
```bash
cd backend
./mvnw test
```

---

## 🧩 ARQUIVOS IMPORTANTES

- `Dockerfile`: Build de frontend + backend.
- `Procfile`: Configura a execução do projeto no Heroku.
- `server.js`: Servidor Express para servir o Angular em produção.
- `angular.json`: Configuração de build Angular com tema e assets.
- `swagger-ui.html`: Documentação interativa da API REST.

---

## 👤 Autor

Lailson Santos - [github.com/lailsonsantos](https://github.com/lailsonsantos)
