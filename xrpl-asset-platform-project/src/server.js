const express = require('express');
const bodyParser = require('body-parser');
const sessionRoutes = require('./routes/sessionRoutes');
const db = require('./db');
const cors = require('cors');

// Créer la base de données si elle n'existe pas encore
db.createTable();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());  // Parser les requêtes JSON
app.use('/sessions', sessionRoutes);  // Utiliser les routes définies pour les sessions
/*app.post('/sessions/add', (req, res) => {
    const { address } = req.body;  // Récupère l'adresse dans le body de la requête
    console.log(address);
    if (!address) {
        return res.status(400).json({ error: 'Adresse manquante' });
    }

    // Ajouter l'adresse du wallet dans la base de données (ou autre logique)
    db.addAccount(address);

    // Répondre avec succès
    res.json({ success: true, message: `Compte avec l'adresse ${address} ajouté.` });
});*/

app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
});
