const passwordValidator = require('password-validator');

/*****  Module Password  *****/
/* Création d'un schéma pour le password : entre 8 et 100 caractères dont au moins 1 majuscules 1 minuscule 2 chiffres et sans espaces */
/* Exportation du schéma pour comparaisonn fonction next si valide sinon message erreur */

const schema = new passwordValidator();

schema
  .is()
  .min(8)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .not()
  .spaces()
  .is()
  .not()
  .oneOf(['Passw0rd', 'Password123']);

module.exports = (req, res, next) => {
  if (!schema.validate(req.body.password)) {
    res.writeHead(
      400,
      'Doit contenir 8 caractères majuscule, miniscules, chiffres sans espaces',
      {
        'content-type': 'application/json',
      }
    );
    res.end('Format incorrect.');
  } else {
    next();
  }
};