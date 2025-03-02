const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Route pour ajouter un compte
router.post('/add', sessionController.addAccount);

// Route pour obtenir tous les comptes
router.get('/all', sessionController.getAllAccounts);

router.delete('/remove', sessionController.removeAccount);


module.exports = router;
