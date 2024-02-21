const UserModel = require('../models/user.model'); // Importation du modèle d'utilisateur
const jwt = require('jsonwebtoken'); // Importation du module JSON Web Token
const { signUpErrors, signInErrors } = require('../utilsateurs/errors.utils'); // Importation des fonctions de gestion des erreurs de connexion

const maxAge = 3 * 24 * 60 * 60 * 1000; // Définition de la durée maximale de validité du token (3 jours en millisecondes)

// Fonction pour créer un token JWT
const createToken = (id) => {
  return jwt.sign({id}, process.env.TOKEN_SECRET, { // Création du token avec l'ID de l'utilisateur et la clé secrète
    expiresIn: maxAge // Spécification de la durée de validité du token
  })
};

// Fonction pour l'inscription d'un utilisateur
module.exports.signUp = async (req, res) => {
  console.log(req.body); // Affichage des données reçues dans la requête
  const {pseudo, email, password} = req.body; // Extraction des champs pseudo, email et mot de passe du corps de la requête

  try {
    const user = await UserModel.create({pseudo, email, password }); // Création d'un nouvel utilisateur avec les données fournies
    res.status(201).json({ user: user._id }); // Envoi de la réponse avec l'ID de l'utilisateur créé
  }
  catch(err) {
    const errors = signUpErrors(err); // Traitement des erreurs spécifiques à l'inscription
    res.status(200).send({ errors }); // Envoi des erreurs sous forme de réponse
  }
};

// Fonction pour la connexion d'un utilisateur
module.exports.signIn = async (req, res) => {
  const { email, password } = req.body; // Extraction des champs email et mot de passe du corps de la requête

  try {
    const user = await UserModel.login(email, password); // Tentative de connexion de l'utilisateur avec les identifiants fournis
    const token = createToken(user._id); // Création du token JWT pour cet utilisateur
    res.cookie('jwt', token, { httpOnly: true, maxAge}); // Stockage du token dans un cookie sécurisé avec une durée de validité spécifiée
    res.status(200).json({ user: user._id }); // Envoi de la réponse avec l'ID de l'utilisateur connecté
  } catch (err){
    const errors = signInErrors(err); // Traitement des erreurs spécifiques à la connexion
    res.status(200).json({ errors }); // Envoi des erreurs sous forme de réponse
  }
};

// Fonction pour la déconnexion d'un utilisateur
module.exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 }); // Suppression du cookie contenant le token en fixant sa durée de validité à 1 milliseconde
  res.redirect('/'); // Redirection vers la page d'accueil
};
