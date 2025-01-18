import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Vendor name
  contact: { type: String, required: true }, // Contact number
  email: { type: String, required: true, unique: true }, // Vendor email (unique)
  address: { type: String, required: true }, // Vendor address
  materials: [
    {
      material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true }, // Material ID
      costPerUnit: { type: Number, required: true }, // Cost per unit for this vendor
    },
  ],
});

export const Vendor = mongoose.model("Vendor", vendorSchema);
