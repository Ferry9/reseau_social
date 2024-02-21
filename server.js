const express = require('express'); // Importation du module Express
const bodyParser = require('body-parser'); // Importation du module body-parser pour analyser les corps de requête
const cookieParser = require('cookie-parser'); // Importation du module cookie-parser pour analyser les cookies
const userRoutes = require('./routes/user.routes'); // Importation des routes utilisateur
const postRoutes = require('./routes/post.routes'); // Importation des routes de publication
// require('dotenv').config(); // Importation de la configuration dotenv (désactivée dans cet exemple)
require('./config/db'); // Importation de la configuration de la base de données
const {checkUser, requireAuth} = require('./middleware/auth.middleware'); // Importation des middlewares d'authentification
const cors = require('cors'); // Importation du module CORS pour gérer les requêtes cross-origin

const app = express(); // Création d'une instance d'application Express

const corsOptions = { // Options CORS pour configurer les en-têtes CORS
  origin: process.env.CLIENT_URL, // URL autorisée pour les requêtes CORS (provient de la variable d'environnement CLIENT_URL)
  credentials: true, // Activation des cookies et des en-têtes CORS
  'allowedHeaders': ['sessionId', 'Content-Type'], // Liste des en-têtes autorisés
  'exposedHeaders': ['sessionId'], // Liste des en-têtes exposés
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE', // Méthodes HTTP autorisées
  'preflightContinue': false // Désactivation de la poursuite des requêtes de pré-vérification CORS
}
app.use(cors(corsOptions)); // Utilisation du middleware CORS avec les options configurées

app.use(bodyParser.json()); // Middleware pour parser les corps de requête au format JSON
app.use(bodyParser.urlencoded({extended: true})); // Middleware pour parser les corps de requête au format URL encodé
app.use(cookieParser()); // Middleware pour parser les cookies

// Middleware pour vérifier l'utilisateur à chaque requête
app.get('*', checkUser);
// Endpoint pour récupérer l'ID de l'utilisateur à partir du token JWT
app.get('/jwtid', requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id); // Renvoie l'ID de l'utilisateur extrait du middleware requireAuth
});

// Routes pour les utilisateurs
app.use('/api/user', userRoutes);
// Routes pour les publications
app.use('/api/post', postRoutes);

const port = process.env.PORT; // Récupération du port depuis la variable d'environnement PORT
// Démarrage du serveur Express
app.listen(port, () => {
  console.log('Serveur démarré au port ' + port); // Affichage d'un message dans la console indiquant que le serveur est démarré
})
