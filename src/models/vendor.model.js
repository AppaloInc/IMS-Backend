import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }, // Vendor name
  contact: { type: String, required: true }, // Contact number
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    validate: {
      validator: function (value) {
        // Basic email regex to check for the presence of "@" and "."
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email format" // Custom error message for invalid email
    }
  },
  address: { type: String, required: true }, // Vendor address
  materials: [
    {
      material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true }, // Material ID
      costPerUnit: { 
        type: Number, 
        required: true, 
        min: [0.01, "Cost per unit must be a positive value"] // Ensure costPerUnit is positive
      },
    },
  ],
});

export const Vendor = mongoose.model("Vendor", vendorSchema);
