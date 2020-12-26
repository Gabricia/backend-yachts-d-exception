import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Data from "./data.js";
import Bateau from "./bateauModel.js";
import nodemailer from "nodemailer";
import creds from "./config.js";

//==================
//app config
//==================
const app = express();
const port = process.env.PORT || 3001;
dotenv.config();

//==================
//middleware
//==================
app.use(express.json());
app.use(cors());

//==================
//db config
//==================

mongoose.connect(process.env.DATABASE_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.once("open", () => {
  console.log("db connected");
});

//==================
//api endpoints or routes
//==================

//testing purpose
app.get("/", (req, res) =>
  res.status(200).send("hello the api endpoints is working")
);

//testing purpose
app.get("/testData", (req, res) => res.status(200).send(Data));

// Create a new Bateau
app.post("/bateaux", (req, res) => {
  console.log("front end call for create");
  // Create a Bateau
  const bateau = req.body;

  // Save Bateau in the database

  Bateau.create(bateau, (err, data) => {
    if (err) {
      Res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// Retrieve all Bateaux
app.get("/bateaux", (req, res) => {
  console.log("front end call for all");
  Bateau.find()
    .then((bateaux) => {
      res.send(bateaux);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Il y eu un problème lors de la recherche de bateaux.",
      });
    });
});

// Retrieve a single Bateau with id
app.get("/bateaux/:id", (req, res) => {
  Bateau.findById(req.params.id)
    .then((bateau) => {
      res.send(bateau);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "bateau not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving bateau with id " + req.params.id,
      });
    });
});

// Update a Bateau with Id
app.patch("/bateaux/:id", (req, res) => {
  // Find bateau and update it with the request body
  Bateau.findByIdAndUpdate(req.params.id, req.body)
    .then((bateau) => {
      if (!bateau) {
        return res.status(404).send({
          message: "Bateau not found with id " + req.params.id,
        });
      }
      res.send(bateau);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Bateau not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error updating bateau with id " + req.params.id,
      });
    });
});

// Delete a Bateau with Id
app.delete("/bateaux/:id", (req, res) => {
  Bateau.findByIdAndRemove(req.params.id)
    .then((bateau) => {
      if (!bateau) {
        return res.status(404).send({
          message: "Bateau not found with id " + req.params.id,
        });
      }
      res.send({ message: "Bateau deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Bateau not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete bateau with id " + req.params.id,
      });
    });
});

//================================
//receving contact mail info and sending it back the email of the founder
//================================

const transport = {
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: creds.USER,
    pass: creds.PASS,
  },
};

const transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take messages");
  }
});

app.post("/contact", (req, res, next) => {
  const nom = req.body.data.nom;
  const prenom = req.body.data.prenom;
  const email = req.body.data.email;
  const numero = req.body.data.numero;
  const message = req.body.data.message;
  const content = `nom: ${nom} \n prenom: ${prenom} \n email: ${email} \n numero: ${numero} \n message: ${message} `;

  const mail = {
    from: email,
    to: "couachf@gmail.com",
    subject: "Nouveau message sur Yachts d'exception",
    text: content,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "success",
      });
    }
  });
});

//listen
app.listen(port, () => console.log(`listening on localhost ${port}`));
