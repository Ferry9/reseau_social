const UserModel = require("../models/user.model"); // Importation du modèle utilisateur
const fs = require("fs"); // Importation du module File System de Node.js pour manipuler les fichiers
const { promisify } = require("util"); // Importation de la fonction utilitaire "promisify" pour convertir une fonction prenant un rappel (callback) en une fonction qui renvoie une promesse
const pipeline = promisify(require("stream").pipeline); // Utilisation de "promisify" pour convertir la fonction "pipeline" en une version asynchrone qui renvoie une promesse
const { uploadErrors } = require("../utilsateurs/errors.utils"); // Importation des erreurs liées aux téléversements

// Fonction pour téléverser une image de profil
module.exports.uploadProfil = async (req, res) => {
  try {
    // Vérification du type MIME de l'image
    if (
      req.file.detectedMimeType != "image/jpg" &&
      req.file.detectedMimeType != "image/png" &&
      req.file.detectedMimeType != "image/jpeg"
    )
      throw Error("invalid file"); // Si le type MIME de l'image n'est pas pris en charge, lance une erreur

    // Vérification de la taille de l'image
    if (req.file.size > 500000) throw Error("max size"); // Si la taille de l'image dépasse la limite autorisée, lance une erreur
  } catch (err) {
    const errors = uploadErrors(err); // Gestion des erreurs de téléversement
    return res.status(201).json({ errors }); // Retourne les erreurs au client
  }

  const fileName = req.body.name + ".jpg"; // Nom de fichier pour l'image de profil

  // Utilisation de "pipeline" pour copier le contenu du flux (stream) de l'image téléversée vers un fichier sur le serveur
  await pipeline(
    req.file.stream, // Flux de l'image téléversée
    fs.createWriteStream( // Création d'un flux d'écriture pour écrire les données dans un fichier sur le serveur
      `${__dirname}/../client/public/uploads/profil/${fileName}` // Chemin où enregistrer le fichier
    )
  );

  try {
    // Mise à jour de l'utilisateur avec le chemin de l'image de profil
    await UserModel.findByIdAndUpdate(
      req.body.userId, // ID de l'utilisateur
      { $set: { picture: "./uploads/profil/" + fileName } }, // Mise à jour du champ "picture" avec le chemin de l'image
      { new: true, upsert: true, setDefaultsOnInsert: true } // Options de mise à jour du document utilisateur
    )
    .then((data) => res.send(data)) // Si la mise à jour réussit, renvoie les données mises à jour de l'utilisateur
    .catch((err) => res.status(500).send({ message: err })); // Si une erreur se produit lors de la mise à jour, renvoie une erreur au client
  } catch (err) {
    return res.status(500).send({ message: err }); // En cas d'erreur, renvoie une erreur au client
  }
};
