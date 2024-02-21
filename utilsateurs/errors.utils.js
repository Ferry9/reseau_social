// Fonction pour gérer les erreurs lors de l'inscription
module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "", password: "" }; // Initialisation d'un objet d'erreurs avec des champs vides pour pseudo, email et mot de passe

  // Vérification de l'erreur liée au pseudo
  if (err.message.includes("pseudo"))
    errors.pseudo = "Pseudo incorrect ou déjà pris"; // Si l'erreur concerne le pseudo, définit un message d'erreur approprié

  // Vérification de l'erreur liée à l'email
  if (err.message.includes("email")) errors.email = "Email incorrect"; // Si l'erreur concerne l'email, définit un message d'erreur approprié

  // Vérification de l'erreur liée au mot de passe
  if (err.message.includes("password"))
    errors.password = "Le mot de passe doit faire 6 caractères minimum"; // Si l'erreur concerne le mot de passe, définit un message d'erreur approprié

  // Vérification de l'erreur de duplication du pseudo dans la base de données
  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("pseudo"))
    errors.pseudo = "Ce pseudo est déjà pris"; // Si le code d'erreur est 11000 et concerne le pseudo, définit un message d'erreur de duplication approprié

  // Vérification de l'erreur de duplication de l'email dans la base de données
  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
    errors.email = "Cet email est déjà enregistré"; // Si le code d'erreur est 11000 et concerne l'email, définit un message d'erreur de duplication approprié

  return errors; // Retourne l'objet d'erreurs
};

// Fonction pour gérer les erreurs lors de la connexion
module.exports.signInErrors = (err) => {
  let errors = { email: '', password: ''}; // Initialisation d'un objet d'erreurs avec des champs vides pour l'email et le mot de passe

  // Vérification de l'erreur liée à l'email
  if (err.message.includes("email")) 
    errors.email = "Email inconnu"; // Si l'erreur concerne l'email, définit un message d'erreur approprié
  
  // Vérification de l'erreur liée au mot de passe
  if (err.message.includes('password'))
    errors.password = "Le mot de passe ne correspond pas"; // Si l'erreur concerne le mot de passe, définit un message d'erreur approprié

  return errors; // Retourne l'objet d'erreurs
}

// Fonction pour gérer les erreurs lors du téléversement de fichiers
module.exports.uploadErrors = (err) => {
  let errors = { format: '', maxSize: ""}; // Initialisation d'un objet d'erreurs avec des champs vides pour le format et la taille maximale

  // Vérification de l'erreur de format de fichier invalide
  if (err.message.includes('invalid file'))
    errors.format = "Format incompatible"; // Si l'erreur concerne le format de fichier, définit un message d'erreur approprié

  // Vérification de l'erreur de dépassement de la taille maximale du fichier
  if (err.message.includes('max size'))
    errors.maxSize = "Le fichier dépasse 500ko"; // Si l'erreur concerne la taille maximale du fichier, définit un message d'erreur approprié

  return errors; // Retourne l'objet d'erreurs
}
