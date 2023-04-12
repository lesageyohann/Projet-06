const Sauce = require('../models/sauce');
const fs = require('fs');

/********************************************************************** */
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

/********************************************************************** */
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

/********************************************************************** */
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

/********************************************************************** */
exports.getOneSauce = (req, res, next) => {
  
  Sauce.findOne({_id: req.params.id })
    .then((sauce) =>{ res.status(200).json(sauce)})
    .catch((error) => res.status(404).json({ error }));
};

/********************************************************************** */
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/********************************************************************** */
exports.likeSauce = (req, res, next) => {

  const userid = req.auth.userId
  const like = req.body.like

  /* Switch like */
  if (![1, -1, 0].includes(like)) 
      return res.status(403).send({message: 'Valeur non valide'});

  Sauce.findOne({_id: req.params.id})
  /* Like +1 */
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
        if (like === 0) {
          if (sauce.usersLiked.includes(userid)) {
            sauce.likes--
            sauce.usersLiked.filter(user => user !== userid)
            sauce.save()
              .then(() => { res.status(201).json({message: 'Like -1'})})
              .catch(error => { res.status(400).json( { error })})
              console.log(userid)
          }
  /* Dislike -1 */
          if (sauce.usersDisliked.includes(userid)) {
            sauce.dislikes--
            sauce.usersDisliked.filter(user => user !== userid)
            sauce.save()
              .then(() => { res.status(201).json({message: 'Dislike -1'})})
              .catch(error => { res.status(400).json( { error })})
          }
        }
  /* Dislike +1 */
        if (like === -1) {
          if (sauce.usersDisliked.includes(userid)) {
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
