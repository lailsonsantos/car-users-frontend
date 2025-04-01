FROM node:22.14.0

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de package
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Exponha a porta 4200
EXPOSE 4200

# Comando para iniciar a aplicação no modo de desenvolvimento
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
