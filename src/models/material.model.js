import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the material (e.g., pigments, solvents)
  stock: { type: Number, required: true, default: 0 }, // Current stock quantity
  unit: { type: String, required: true }, // Unit of measurement (e.g., kg, liters)
  costPerUnit: { type: Number, required: true }, // Cost per unit of material
  description: { type: String }, // Optional description of the material
});

export const Material = mongoose.model('Material', materialSchema);
