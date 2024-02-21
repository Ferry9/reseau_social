const jwt = require("jsonwebtoken"); // Importation du module JSON Web Token
const UserModel = require("../models/user.model"); // Importation du modèle d'utilisateur

// Middleware pour vérifier l'utilisateur
module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt; // Récupération du token depuis les cookies de la requête
  if (token) { // Vérifie s'il y a un token
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => { // Vérification de la validité du token
      if (err) { // Si une erreur se produit lors de la vérification
        res.locals.user = null; // Définition de l'utilisateur comme null dans les variables locales
        // res.cookie("jwt", "", { maxAge: 1 }); // Suppression du cookie contenant le token
        next(); // Passage au middleware suivant
      } else { // Si le token est valide
        let user = await UserModel.findById(decodedToken.id); // Recherche de l'utilisateur dans la base de données à partir de l'ID du token
        res.locals.user = user; // Stockage de l'utilisateur dans les variables locales
        next(); // Passage au middleware suivant
      }
    });
  } else { // Si aucun token n'est trouvé
    res.locals.user = null; // Définition de l'utilisateur comme null dans les variables locales
    next(); // Passage au middleware suivant
  }
};

// Middleware pour exiger l'authentification
module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt; // Récupération du token depuis les cookies de la requête
  if (token) { // Vérifie s'il y a un token
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => { // Vérification de la validité du token
      if (err) { // Si une erreur se produit lors de la vérification
        console.log(err); // Affichage de l'erreur dans la console
        res.send(200).json('no token'); // Envoi d'une réponse indiquant l'absence de token
      } else { // Si le token est valide
        console.log(decodedToken.id); // Affichage de l'ID décodé du token dans la console
        next(); // Passage au middleware suivant
      }
    });
  } else { // Si aucun token n'est trouvé
    console.log('No token'); // Affichage d'un message indiquant l'absence de token dans la console
  }
};
