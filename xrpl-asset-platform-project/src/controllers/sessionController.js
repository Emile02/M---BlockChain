const db = require('../db');  // Importer le module de gestion de la base de données

// Ajouter un compte à la base de données
function addAccount(req, res) {
    const { address } = req.body;  // On suppose que l'adresse est envoyée dans le corps de la requête
    db.addAccount(address);
    res.send({ success: true, message: 'Compte ajouté avec succès' });
}

function removeAccount(req, res) {
    const { address } = req.body;
    db.removeAccount(address);
    res.send({ success: true, message: 'Compte supprimé avec succès' });
}

// Récupérer tous les comptes
function getAllAccounts(req, res) {
    db.getAllAccounts((err, accounts) => {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la récupération des comptes' });
        }
        res.send({ accounts });
    });
}

module.exports = { addAccount, getAllAccounts, removeAccount };
