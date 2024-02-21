const PostModel = require("../models/post.model"); // Importation du modèle de publication
const UserModel = require("../models/user.model"); // Importation du modèle d'utilisateur
const { uploadErrors } = require("../utilsateurs/errors.utils"); // Importation de la fonction de gestion des erreurs de téléchargement
const ObjectID = require("mongoose").Types.ObjectId; // Importation de la classe ObjectId de Mongoose
const fs = require("fs"); // Importation du module 'fs' (système de fichiers) de Node.js
const { promisify } = require("util"); // Importation de la fonction promisify pour transformer des fonctions de rappel en fonctions asynchrones
const pipeline = promisify(require("stream").pipeline); // Importation de la fonction pipeline pour gérer les flux de données de manière asynchrone

// Fonction pour lire toutes les publications
module.exports.readPost = (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) res.send(docs); // Si aucune erreur, renvoie toutes les publications
    else console.log("Erreur pour obtenir les données : " + err); // Sinon, affiche l'erreur dans la console
  }).sort({ createdAt: -1 }); // Trie les publications par date de création décroissante
};

// Fonction pour créer une nouvelle publication
module.exports.createPost = async (req, res) => {
  let fileName; // Déclaration d'une variable pour le nom du fichier

  if (req.file !== null) { // Vérifie si un fichier est téléchargé
    try {
      if (
        req.file.detectedMimeType != "image/jpg" &&
        req.file.detectedMimeType != "image/png" &&
        req.file.detectedMimeType != "image/jpeg"
      )
        throw Error("fichier invalide"); // Si le type MIME du fichier n'est pas une image, lance une erreur

      if (req.file.size > 500000) throw Error("taille maximale"); // Si la taille du fichier dépasse 500000 octets, lance une erreur
    } catch (err) {
      const errors = uploadErrors(err); // Traitement des erreurs de téléchargement
      return res.status(201).json({ errors }); // Envoi des erreurs sous forme de réponse
    }
    fileName = req.body.posterId + Date.now() + ".jpg"; // Génération du nom de fichier unique
    await pipeline(
      req.file.stream, // Flux de données du fichier téléchargé
      fs.createWriteStream(
        `${__dirname}/../client/public/uploads/posts/${fileName}`
      ) // Création d'un fichier avec le nom généré
    );
  }

  const newPost = new PostModel({
    posterId: req.body.posterId, // ID de l'utilisateur qui a posté
    message: req.body.message, // Message de la publication
    picture: req.file !== null ? "./uploads/posts/" + fileName : "", // Chemin de l'image de la publication
    video: req.body.video, // Lien vidéo de la publication
    likers: [], // Tableau des ID des utilisateurs qui ont aimé la publication
    comments: [], // Tableau des commentaires de la publication
  });

  try {
    const post = await newPost.save(); // Enregistrement de la nouvelle publication dans la base de données
    return res.status(201).json(post); // Envoi de la publication créée sous forme de réponse
  } catch (err) {
    return res.status(400).send(err); // Envoi d'une erreur en cas d'échec de l'enregistrement
  }
};

// Fonction pour mettre à jour une publication
module.exports.updatePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID de la publication est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID est invalide, renvoie une erreur

  const updatedRecord = {
    message: req.body.message, // Nouveau message de la publication
  };

  PostModel.findByIdAndUpdate(
    req.params.id, // ID de la publication à mettre à jour
    { $set: updatedRecord }, // Enregistrement des nouvelles données
    { new: true }, // Option pour renvoyer le document mis à jour
    (err, docs) => {
      if (!err) res.send(docs); // Si aucune erreur, renvoie le document mis à jour
      else console.log("Erreur de mise à jour : " + err); // Sinon, affiche l'erreur dans la console
    }
  );
};

// Fonction pour supprimer une publication
module.exports.deletePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID de la publication est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID est invalide, renvoie une erreur

  PostModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs); // Si aucune erreur, renvoie le document supprimé
    else console.log("Erreur de suppression : " + err); // Sinon, affiche l'erreur dans la console
  });
};

// Fonction pour liker une publication
module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID de la publication est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID est invalide, renvoie une erreur

  try {
    await PostModel.findByIdAndUpdate(
      req.params.id, // ID de la publication à liker
      {
        $addToSet: { likers: req.body.id }, // Ajout de l'ID de l'utilisateur dans le tableau des likers de la publication
      },
      { new: true }) // Option pour renvoyer le document mis à jour
      .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie le document mis à jour
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur

    await UserModel.findByIdAndUpdate(
      req.body.id, // ID de l'utilisateur qui a liké
      {
        $addToSet: { likes: req.params.id }, // Ajout de l'ID de la publication dans le tableau des likes de l'utilisateur
      },
      { new: true }) // Option pour renvoyer le document mis à jour
      .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie le document mis à jour
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur
  } catch (err) {
    return res.status(400).send(err); // Envoi d'une erreur en cas d'échec
  }
};

// Fonction pour unliker une publication
module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID de la publication est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID est invalide, renvoie une erreur

  try {
    await PostModel.findByIdAndUpdate(
      req.params.id, // ID de la publication à unliker
      {
        $pull: { likers: req.body.id }, // Retrait de l'ID de l'utilisateur du tableau des likers de la publication
      },
      { new: true }) // Option pour renvoyer le document mis à jour
      .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie le document mis à jour
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur

    await UserModel.findByIdAndUpdate(
      req.body.id, // ID de l'utilisateur qui a unliké
      {
        $pull: { likes: req.params.id }, // Retrait de l'ID de la publication du tableau des likes de l'utilisateur
      },
      { new: true }) // Option pour renvoyer le document mis à jour
      .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie le document mis à jour
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur
  } catch (err) {
    return res.status(400).send(err); // Envoi d'une erreur en cas d'échec
  }
};

// Fonction pour commenter une publication
module.exports.commentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID de la publication est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID est invalide, renvoie une erreur

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id, // ID de la publication à commenter
      {
        $push: {
          comments: { // Ajout d'un nouveau commentaire
            commenterId: req.body.commenterId, // ID du commentateur
            commenterPseudo: req.body.commenterPseudo, // Pseudo du commentateur
            text: req.body.text, // Texte du commentaire
            timestamp: new Date().getTime(), // Horodatage du commentaire
          },
        },
      },
      { new: true }) // Option pour renvoyer le document mis à jour
      .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie le document mis à jour
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur
  } catch (err) {
    return res.status(400).send(err); // Envoi d'une erreur en cas d'échec
  }
};

// Fonction pour éditer un commentaire sur une publication
module.exports.editCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID de la publication est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID est invalide, renvoie une erreur

  try {
    return PostModel.findById(req.params.id, (err, docs) => { // Recherche de la publication par son ID
      const theComment = docs.comments.find((comment) => // Recherche du commentaire à éditer dans la liste des commentaires de la publication
        comment._id.equals(req.body.commentId)
      );

      if (!theComment) return res.status(404).send("Commentaire non trouvé"); // Si le commentaire n'est pas trouvé, renvoie une erreur 404

      theComment.text = req.body.text; // Modification du texte du commentaire

      return docs.save((err) => { // Enregistrement des modifications
        if (!err) return res.status(200).send(docs); // Si aucune erreur, renvoie le document mis à jour
        return res.status(500).send(err); // Sinon, renvoie une erreur 500
      });
    });
  } catch (err) {
    return res.status(400).send(err); // Envoi d'une erreur en cas d'échec
  }
};

// Fonction pour supprimer un commentaire sur une publication
module.exports.deleteCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) // Vérifie si l'ID de la publication est valide
    return res.status(400).send("ID inconnu : " + req.params.id); // Si l'ID est invalide, renvoie une erreur

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id, // ID de la publication à modifier
      {
        $pull: { // Retrait du commentaire de la liste des commentaires de la publication
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }) // Option pour renvoyer le document mis à jour
      .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie le document mis à jour
      .catch((err) => res.status(500).send({ message: err })); // Sinon, renvoie une erreur
  } catch (err) {
    return res.status(400).send(err); // Envoi d'une erreur en cas d'échec
  }
};
