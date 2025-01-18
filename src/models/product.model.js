import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  rawMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
});

module.exports = mongoose.model('Product', productSchema);
