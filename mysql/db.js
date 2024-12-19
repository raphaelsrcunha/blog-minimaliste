require('dotenv').config();

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blog"
});

db.connect(err => {
    if (err) {
        console.log('Erreur de connexion à la base de données MySQL: ', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
})

module.exports = db;