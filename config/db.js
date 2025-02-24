const sqlite = require('sqlite');  // Importa el paquete correcto
const sqlite3 = require('sqlite3');

async function connectDB() {
    return await sqlite.open({
        filename: './database/bar.db',
        driver: sqlite3.Database
    });
}

module.exports = connectDB;
