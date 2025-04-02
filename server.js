const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname + '/dist/car-users-frontend'));

app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname + '/dist/car-users-frontend/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});