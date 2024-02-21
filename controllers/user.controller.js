const UserModel = require("../models/user.model"); // Importation du modèle d'utilisateur
const ObjectID = require("mongoose").Types.ObjectId; // Importation de la classe ObjectId de Mongoose

// Fonction pour récupérer tous les utilisateurs
module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password"); // Recherche de tous les utilisateurs et sélection de tous les champs sauf le mot de passe
  res.status(200).json(users); // Renvoi des utilisateurs au format JSON
};

// Fonction pour récupérer les informations d'un utilisateur spécifique
module.exports.userInfo = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID n'est pas valide, renvoie une erreur
/**
 * 
 * 
 * Tous les users sauf mot de passe
 * 
 */
  UserModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs); // Si aucune erreur, renvoie les informations de l'utilisateur
    else console.log("ID inconnu : " + err); // Sinon, affiche l'erreur dans la console
  }).select("-password"); // Sélectionne tous les champs sauf le mot de passe
};
/**
 * 
 * 1 seul utilistaur
 * 
 * 
 * 
 */


// Fonction pour mettre à jour un utilisateur
module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID n'est pas valide, renvoie une erreur

  try {
    await UserModel.findOneAndUpdate(
      { _id: req.params.id }, // Recherche de l'utilisateur par son ID
      {
        $set: {
          bio: req.body.bio, // Mise à jour du champ "bio" avec la valeur fournie dans la requête
          pseudo: req.body.pseudo, // Mise à jour du champ "pseudo" avec la valeur fournie dans la requête
          email: req.body.email, // Mise à jour du champ "email" avec la valeur fournie dans la requête
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true } // Options pour retourner le nouvel utilisateur et créer s'il n'existe pas
    )
      .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie les nouvelles données de l'utilisateur
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur
  } catch (err) {
    return res.status(500).json({ message: err }); // Si une erreur se produit, renvoie une erreur
  }
};

/**
 * Supprimme user
 * 
 * 
 */

// Fonction pour supprimer un utilisateur
module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID n'est pas valide, renvoie une erreur

  try {
    await UserModel.remove({ _id: req.params.id }).exec(); // Supprime l'utilisateur par son ID
    res.status(200).json({ message: "Supprimé avec succès." }); // Renvoie un message indiquant que l'utilisateur a été supprimé avec succès
  } catch (err) {
    return res.status(500).json({ message: err }); // Si une erreur se produit, renvoie une erreur
  }
};



/**
 * 
 * Like
 * 
 */
// Fonction pour suivre un utilisateur
module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID inconnu : " + req.params.id); // Vérifie si les IDs sont valides

  try {
    // Ajouter à la liste des abonnés
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } }, // Ajoute l'ID de l'utilisateur à suivre à la liste des abonnés
      { new: true, upsert: true } // Options pour retourner le nouvel utilisateur et créer s'il n'existe pas
    )
      .then((data) => res.send(data)) // Si l'opération réussit, renvoie les nouvelles données de l'utilisateur
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur

    // Ajouter à la liste des abonnements
    await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } }, // Ajoute l'ID de l'utilisateur suiveur à la liste des abonnements de l'utilisateur suivi
      { new: true, upsert: true } // Options pour retourner le nouvel utilisateur et créer s'il n'existe pas
    )
      .then((data) => res.send(data)) // Si l'opération réussit, renvoie les nouvelles données de l'utilisateur
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur
  } catch (err) {
    return res.status(500).json({ message: err }); // Si une erreur se produit, renvoie une erreur
  }
};


/**
 * 
 * Dislike user
 * 
 * 
 */
// Fonction pour ne plus suivre un utilisateur
module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  )
    return res.status(400).send("ID inconnu : " + req.params.id); // Vérifie si les IDs sont valides

  try {
    await userModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } }, // Retire l'ID de l'utilisateur à ne plus suivre de la liste des abonnés
      { new: true, upsert: true } // Options pour retourner le nouvel utilisateur et créer s'il n'existe pas
    )
      .then((data) => res.send(data)) // Si l'opération réussit, renvoie les nouvelles données de l'utilisateur
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur

    // Retirer de la liste des abonnements
    await userModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } }, // Retire l'ID de l'utilisateur suiveur de la liste des abonnements de l'utilisateur suivi
      { new: true, upsert: true } // Options pour retourner le nouvel utilisateur et créer s'il n'existe pas
    )
      .then((data) => res.send(data)) // Si l'opération réussit, renvoie les nouvelles données de l'utilisateur
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur
  } catch (err) {
    return res.status(500).json({ message: err }); // Si une erreur se produit, renvoie une erreur
  }
};
