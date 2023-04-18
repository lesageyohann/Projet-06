const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
 
/*****  Module Authentification  *****/
/* Vérification du token d'authenfication */
/* Si token valide alors récupération ID utilisateur et appel fonction next */
/* Sinon message erreur */
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.token);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};