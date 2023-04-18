const express = require('express');
const router = express.Router();

/*****  Définition route Utilisateur  *****/
/* Récupération middleware user */
/* Récupération controller Password */
/* Définition des routes et requête avec module exporté et middleware */

const userCtrl = require('../controllers/user');

const controlPassword = require('../middleware/controlPassword');

router.post('/signup', controlPassword, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;