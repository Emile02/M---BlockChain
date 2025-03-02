
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sessions.db', (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err);
    } else {
        console.log('Base de données ouverte avec succès.');
    }
});

function createTable() {
    db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT UNIQUE,
      last_connected TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table:', err);
        } else {
            console.log('Table "accounts" prête.');
        }
    });
}

function addAccount(address) {
    const stmt = db.prepare('INSERT OR REPLACE INTO accounts (address, last_connected) VALUES (?, ?)');
    stmt.run(address, new Date().toISOString(), (err) => {
        if (err) {
            console.error('Erreur lors de l\'ajout du compte:', err);
        } else {
            console.log(`Compte ${address} ajouté avec succès.`);
        }
    });
    stmt.finalize();
}

function removeAccount(address) {
    const stmt = db.prepare('DELETE FROM accounts WHERE address = ?');  // Ajout de la condition WHERE
    stmt.run(address, (err) => {  // Paramètre address passé correctement
        if (err) {
            console.error('Erreur lors de la suppression du compte:', err);
        } else {
            console.log(`Compte ${address} supprimé avec succès.`);
        }
    });
    stmt.finalize();  // Finalisation de la préparation de la requête
}

function getAllAccounts(callback) {
    db.all('SELECT address, last_connected FROM accounts', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des comptes:', err);
            return callback(err, null);
        }
        return callback(null, rows);
    });
}

module.exports = { createTable, addAccount, getAllAccounts, removeAccount };
