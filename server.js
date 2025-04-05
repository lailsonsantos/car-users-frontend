// const express = require('express');
// const path = require('path');
// const app = express();

// app.use(express.static(__dirname + '/dist/car-users-frontend'));

// app.get('/*', function(req,res) {
//   res.sendFile(path.join(__dirname + '/dist/car-users-frontend/browser/index.html'));
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });

// importar express
const express = require('express');
// iniciar express
const app = express();
// nome da pasta no dist que sera feito o build
const appName = 'car-users-frontend';
// local onde build ira gerar os arquivos
const outputPath = `${__dirname}/dist/${appName}`;

// seta o diretorio de build para servir o conteudo Angular
app.use(express.static(outputPath));
// redirecionar qualquer requisicao para o index.html
app.get('/*', (req, res) => {
  res.sendFile(`${outputPath}/index.html`);
});
// ouvir a porta que o Heroku disponibilizar
app.listen(process.env.PORT);