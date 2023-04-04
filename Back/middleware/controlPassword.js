const passwordValidator = require('password-validator');

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