import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    quantity: { 
      type: Number, 
      required: true, 
      min: [1, "Quantity must be a positive value"] // Ensure quantity is positive 
    },
    costPerUnit: { 
      type: Number, 
      required: true, 
      min: [0.01, "Cost per unit must be a positive value"] // Ensure cost per unit is positive
    },
    totalCost: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
