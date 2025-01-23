import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  quantity: { 
    type: Number, 
    default: 0, 
    min: [0, "Quantity cannot be negative"] // Ensure quantity is non-negative
  },
  pricePerUnit: { 
    type: Number, 
    required: true, 
    min: [0.01, "Price per unit must be a positive value"] // Ensure price per unit is positive
  },
  rawMaterials: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Material", 
      required: true 
    }
  ],
  isAvailable: { //alternative to delete
    type: Boolean, 
    default: true // Products are available by default
  },
});

export const Product = mongoose.model('Product', productSchema);

//ProductSchema
//master paint
//10 boxes
//pricePerUnit
//raw_materials[]



//ProductionSchema
//productName from drop down 
//No of units produced
//

