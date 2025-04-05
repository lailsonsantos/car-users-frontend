# Car Users Fullstack App 🚗👤

Aplicação Fullstack Angular + Spring Boot com login, cadastro e gerenciamento de usuários e carros.

---

## ✅ Estórias de Usuário

1. Eu, como usuário, desejo me autenticar com login e senha.
2. Eu, como usuário, desejo cadastrar minha conta e enviar uma foto.
3. Eu, como usuário autenticado, desejo adicionar carros, editar e excluir.
4. Eu, como administrador, desejo listar todos os usuários e seus carros.
5. Eu, como desenvolvedor, desejo visualizar a documentação Swagger.
6. Eu, como devops, desejo rodar tudo com Docker e deployar no Heroku.
7. Eu, como usuário, desejo que todas as mensagens de erro tenham padrão JSON.

---

## 💡 Solução Técnica

- Angular 15+ no front-end com AuthInterceptor e roteamento
- Spring Boot no back-end com autenticação JWT
- Upload de imagem com multipart/form-data
- Swagger para documentação
- Docker multi-stage (build front + back)
- Deploy automatizado no Heroku com `heroku.yml` e `Procfile`

---

## 🚀 Como executar localmente

```bash
# Requisitos
Java 17, Node 18, Maven, Angular CLI, Docker

# Rodar localmente sem Docker
cd frontend && npm install && ng build --configuration production
cd ../backend && ./mvnw spring-boot:run
```

---

## ▶️ Como rodar localmente

```bash
npm install
ng serve

Acesse: http://localhost:4200

🐳 Docker + Express
# Build da imagem
docker compose up --build

# Acesse
http://localhost:4201

🔧Deploy no Heroku (buildpack Node.js)
# Login
heroku login

# Criar app
heroku create pitang-app-frontend

# Setar buildpack
heroku buildpacks:set heroku/nodejs

# Enviar código
git push heroku main
heroku open

🧩 Funcionalidades
Login (/login)

Página do usuário logado (/me)

Listagem, cadastro e edição de:

Usuários (/users)

Carros (/cars)

🧪 Testes
ng test

✅ Testado com backend rodando em:
http://localhost:8080
