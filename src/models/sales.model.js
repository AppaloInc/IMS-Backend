import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customerName: {
      type: String,
      default:"None",
      trim: true, // Removes extra spaces
    },
    noOfUnitsSold: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSale: {
      type: Number,
      required: true,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

export const Sales = mongoose.model("Sales", salesSchema);

