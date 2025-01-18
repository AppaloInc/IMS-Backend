import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  quantity: { type: Number, required: true },
  costPerUnit: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
},
{
  timestamps: true
}
);

export const Order = mongoose.model('Order', orderSchema);
