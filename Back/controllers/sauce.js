const Sauce = require('../models/sauce');
const fs = require('fs');

/*****  Création sauce  *****/
/* Récupération des informations de la requête POST représentant le schéma et l'image */
/* Création d'une nouvelle Sauce en utilisant le modèle et ajout différentes propriétées */
/* Sauvegarde de la sauce et message confirmation */
exports.createSauce = (req, res, next) => {
  const sauceObjet = JSON.parse(req.body.sauce);
  delete sauceObjet._id;
  delete sauceObjet._userId;

  const sauce = new Sauce({
    ...sauceObjet,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: 'Sauce enregistré !' });
    })
    .catch((error) => {
      console.log(error);
    });
};

/*****  Modifier sauce  *****/
/* Récupération information sauce + vérifié auth userID */
/* Si ID valide alors création d'un objet sauceObjet pour modification puis mise à jour BDD*/
/* Envoie réponse 200 si valide */
exports.modifySauce = (req, res, next) => {
  const sauceObjet = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObjet._userId;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {       
      console.log("sauce")
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObjet, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Sauce modifié!' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/*****  Supprimer sauce  *****/
/* Rechercher sauce correspondant à l'ID dans parametres requête*/
/* Si ID corresponant a ID créateur alors supprimer sauce et envoi confirmation */
/* Si ID pas correspondant alors envoyé code erreure */
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Sauce supprimé !' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/*****  Récuperer une sauce  *****/
/* Récupération d'une sauce en fonction parametre ID */
exports.getOneSauce = (req, res, next) => {
  
  Sauce.findOne({_id: req.params.id })
    .then((sauce) =>{ res.status(200).json(sauce)})
    .catch((error) => res.status(404).json({ error }));
};

/*****  Récuperer plusieur sauces  *****/
/* récupération de tout les sauce du tableau */
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/*****  Gestion Like  *****/
exports.likeSauce = (req, res, next) => {

  const userid = req.auth.userId
  const like = req.body.like

  /* Switch like */
  /* Gestion valeur -1 / 0 / -1 */
  if (![1, -1, 0].includes(like)) 
      return res.status(403).send({message: 'Valeur non valide'});

  Sauce.findOne({_id: req.params.id})

  /* Like +1 */
  /* Si like = 1 et utilisateur absent du tableau alors like +1, ajout utilisateur et save */
  /* Sinon afficher message */
    .then((sauce) => {
        if (like === 1) {
          if (!sauce.usersLiked.includes(userid)) {
            sauce.likes++
            sauce.usersLiked.push(userid)
            sauce.save()
              .then(() => { res.status(201).json({message: 'Like +1'})})
              .catch(error => { res.status(400).json( { error })})
          }
          else {
            return res.status(400).json({message: 'Sauce déjà liké'});
          }
        }

  /* Like -1 */
  /* like = 0 et utilisateur dans le tableau alors like -1, supprression utilisateur et save */
        if (like === 0) {
          if (sauce.usersLiked.includes(userid)) {
            sauce.likes--
            sauce.usersLiked = sauce.usersLiked.filter(user => user !== userid)
            sauce.save()
              .then(() => { res.status(201).json({message: 'Like -1'})})
              .catch(error => { res.status(400).json( { error })})
          }

  /* Dislike -1 */
  /* Si  utilisateur dans le tableau alors dislike -1, suppression utilisateur et save */
          if (sauce.usersDisliked.includes(userid)) {
            sauce.dislikes--
            sauce.usersDisliked = sauce.usersDisliked.filter(user => user !== userid)
            sauce.save()
              .then(() => { res.status(201).json({message: 'Dislike -1'})})
              .catch(error => { res.status(400).json( { error })})
          }
        }
        
  /* Dislike +1 */
  /* Si like = -1 et utilisateur absent du tableau alors dislike -1, ajout utilisateur et save */
  /* Sinon afficher message */
        if (like === -1) {
          if (!sauce.usersDisliked.includes(userid)) {
            sauce.dislikes++
            sauce.usersDisliked.push(userid)
            sauce.save()
              .then(() => { res.status(201).json({message: 'Dislike +1'})})
              .catch(error => { res.status(400).json( { error })})
          }
          else {
            return res.status(400).json({message: 'Sauce déja dislike'});
          }
        }
      })
    .catch((error) => {
        res.status(400).json({ error });
    });
};
