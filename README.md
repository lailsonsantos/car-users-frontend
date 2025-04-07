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
- Node.js 18+
- Angular CLI
- Docker (opcional)

### 🖥️ Rodando localmente sem Docker

```bash

# Frontend
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
```

---

# ☁️ DEPLOY NA AWS (Manual)

## 🔧 FRONTEND

---

## 📦 1. Build do Projeto Angular

No terminal, execute o comando abaixo para gerar os arquivos de produção:

```bash
ng build --configuration=production
```

Isso criará a pasta `dist/browser`, contendo os arquivos prontos para produção.

---

## 📂 2. Copiar os arquivos do `dist/browser`

Acesse a pasta `dist/browser/seu-projeto/` e copie todos os arquivos gerados (HTML, CSS, JS, etc).

---

## ☁️ 3. Criar bucket S3 na AWS

1. Acesse o console da **AWS S3**: https://s3.console.aws.amazon.com/s3
2. Clique em **"Create bucket"**
3. Dê um nome único (ex: `meu-app-angular-prod`)
4. Desmarque a opção **"Block all public access"**
5. Crie o bucket

### 🔐 Configurar permissões públicas

Depois de criar o bucket:

1. Vá em **"Permissions" > "Bucket policy"**
2. Adicione a seguinte política para permitir acesso público aos arquivos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::meu-app-angular-prod/*"
    }
  ]
}
```

(Altere `meu-app-angular-prod` para o nome do seu bucket)

---

## ⬆️ 4. Fazer upload dos arquivos no S3

1. Vá para a aba **"Objects"** do bucket
2. Clique em **"Upload"**
3. Envie **todos os arquivos da pasta `dist/browser/seu-projeto/`**
4. Marque como **"public"** se solicitado

---

## 🌐 5. Criar uma distribuição CloudFront

1. Acesse o console do **CloudFront**: https://console.aws.amazon.com/cloudfront
2. Clique em **"Create Distribution"**
3. Em **"Origin domain"**, selecione o bucket S3 criado
4. Marque **"Restrict Bucket Access"** como **No**
5. Em **Default root object**, digite: `index.html`
6. Crie a distribuição

---

## ⚠️ 6. Configurar regras de erro (404 e 403)

1. Acesse a distribuição criada no CloudFront
2. Vá na aba **"Error pages"**
3. Clique em **"Create custom error response"**
4. Configure para ambos os erros:

   - **HTTP error code**: `403`
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: `200`

   E depois:

   - **HTTP error code**: `404`
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: `200`

Isso garante que ao acessar rotas do Angular diretamente (como `/login`, `/dashboard`), o app funcione corretamente.

---

## 🔗 URL de produção:

```
https://d1kecc5wokrpzu.cloudfront.net
```

Esse endereço simula o mesmo comportamento de um frontend local em `http://localhost:4200`.

---

## 🧩 ARQUIVOS IMPORTANTES

- `Dockerfile`: Build de frontend.
- `Procfile`: Configura a execução do projeto no Heroku.
- `server.js`: Servidor Express para servir o Angular em produção.
- `angular.json`: Configuração de build Angular com tema e assets.
- `swagger-ui.html`: Documentação interativa da API REST.

---

## 👤 Autor

Lailson Santos - [github.com/lailsonsantos](https://github.com/lailsonsantos)
