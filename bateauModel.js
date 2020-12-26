import mongoose from "mongoose";

const BateauSchema = mongoose.Schema({
  model: String,
  description: String,
  prix: Number,
  reference: String,
  longueur: Number,
  largeur: Number,
  pavillon: String,
  moteurs: String,
  hmoteurs: String,
  annee: Number,
  cabines: String,
  equipage: String,
  eau: String,
  carburant: String,
  photos: Array,
  vendu: Boolean,
  surmesure: Boolean,
  userId: String,
});

//collection inside the database
export default mongoose.model("Bateau", BateauSchema);
