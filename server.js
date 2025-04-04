// const express = require('express');
// const path = require('path');
// const app = express();

// app.use(express.static(__dirname + '/dist/car-users-frontend'));

// app.get('/*', function(req,res) {
//   res.sendFile(path.join(__dirname + '/dist/car-users-frontend/browser/index.html'));
// });

// const PORT = process.env.PORT || 4200;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });

const express = require('express');
const path = require('path');
const app = express();

const distFolder = path.join(__dirname, 'dist', 'car-users-frontend');
app.use(express.static(distFolder));

app.get('*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
