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
  const idUser = req.body.userId;
  const idSauce = req.params.id;
  const stateLike = req.body.like;

  const allowedLike = [-1, 0, 1];
  if (!allowedLike.includes(stateLike)) {
    return res.status(400).json({ message: 'Action non autorisé' });
  }

  Sauce.findOne({ _id: idSauce })
    .then((sauce) => {
      // Switch état like
      switch (stateLike) {
        case 1:
          if (sauce.usersLiked.includes(idUser) && stateLike === 1) {
            res.status(400).json({ message: 'Action non autorisée' });
            return;
          }

          if ( sauce.usersDisliked.includes(idUser) && stateLike === 1) {
            res.status(400).json({ message: 'Action non autorisée' });
            return;
          }

          //like
          if (!sauce.usersLiked.includes(idUser) && stateLike === 1) {
            Sauce.updateOne(
              { _id: idSauce },
              { $inc: { likes: 1 }, $push: { usersLiked: idUser } }
            )
              .then(() =>
                res.status(201).json({ message: 'Like ajouté' })
              )
              .catch((error) => res.status(400).json({ error }));
          }

          break;

        case -1:
          if (sauce.usersLiked.includes(idUser) && stateLike === -1) {
            res.status(400).json({ message: 'Action non autorisée' });
            return;
          }

          //dislike
          if (!sauce.usersDisliked.includes(idUser) && stateLike === -1) {
            Sauce.updateOne(
              { _id: idSauce },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: idUser },
              }
            )
              .then(() =>
                res.status(201).json({ message: 'Dislike ajouté' })
              )
              .catch((error) => res.status(400).json({ error }));
          }

          break;

        case 0:
          if (!sauce.usersDisliked.includes(idUser) && !sauce.usersLiked.includes(idUser)) {
            res.status(400).json({ message: 'Action non autorisée' });
            return;
          }

          //Annuler like
          if (sauce.usersLiked.includes(idUser)) {
            Sauce.updateOne(
              { _id: idSauce },
              { $inc: { likes: -1 }, $pull: { usersLiked: idUser } }
            )
              .then(() =>
                res
                  .status(201)
                  .json({ message: 'Like retiré' })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          //Annuler dislike
          if (sauce.usersDisliked.includes(idUser)) {
            Sauce.updateOne(
              { _id: idSauce },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: idUser },
              }
            )
              .then(() =>
                res
                  .status(201)
                  .json({ message: 'Dislike retiré' })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          break;
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
