# Etapa 1: Construção da Aplicação Angular
FROM node:18 AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia os demais arquivos do projeto
COPY . .

# Compila a aplicação Angular para produção
RUN npm run build -- --configuration production

# Etapa 2: Configuração do Servidor Express
FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários do estágio de build
COPY --from=build /app/dist/car-users-frontend /app/dist/car-users-frontend
COPY server.js .

# Instala as dependências de produção
RUN npm install --only=production

# Expõe a porta em que o aplicativo será executado
EXPOSE 4200

# Comando para iniciar o servidor
CMD ["node", "server.js"]
