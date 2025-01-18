import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Vendor name
  contact: { type: String, required: true }, // Contact number
  email: { type: String, required: true, unique: true }, // Vendor email (unique)
  address: { type: String, required: true }, // Vendor address
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }], // List of materials supplied by the vendor
});

export const Vendor = mongoose.model("Vendor", vendorSchema);
