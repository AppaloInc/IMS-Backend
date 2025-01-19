import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }, // Name of the material (e.g., pigments, solvents)
  stock: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: function (value) {
        return value >= 0; // Stock value must be greater than or equal to 0
      },
      message: "Stock value cannot be negative",
    },
  },
  unit: { type: String, required: true }, // Unit of measurement (e.g., kg, liters)
  threshold: { type: Number, default: 0 },
  description: { type: String }, // Optional description of the material
},
{
  timestamps: true
}
);

export const Material = mongoose.model("Material", materialSchema);
