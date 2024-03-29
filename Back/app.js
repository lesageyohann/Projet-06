const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require("helmet");
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
dotenv.config();

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');



const app = express();

/*** Connection Mongoose ***/

mongoose
  .connect(
    `mongodb+srv://${process.env.login}:${process.env.password}@hotsauce.f8tvhcc.mongodb.net/test`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));
 

  /*** Configuration CORS ***/

  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    next();
  });

/*** Configuration Express ***/

app.use(express.json());


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(helmet());
app.use(mongoSanitize());



module.exports = app;