const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

const indexRouter = require("./routes/index")

//Middleware: usado para ter acesso às requisições e as respostas e fazer algumas ações nela (modificar objetos, passar informações extras etc)
//Acontece o parse para JSON aqui
app.use(express.json());

app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Server en cours d'exécution sur http://localhost:${port}`);
})
