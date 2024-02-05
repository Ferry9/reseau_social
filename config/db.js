const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://" + process.env.DB_USER_PASS + "@cluster0.kmziadh.mongodb.net/reseau_social",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("Connecter à MongoDB"))
  .catch((err) => console.log("Echec de la connection à MongoDB", err));
