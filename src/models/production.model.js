import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for the production record
const ProductionSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    noOfUnitsProduced: {
      type: Number,
      required: true,
      min: 1,
    },
    quantityOfRawMaterials: [
      {
        rawMaterialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Material',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Export the model
export const Production = model('Production', ProductionSchema);

