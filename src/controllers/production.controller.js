import { Production } from "../models/production.model.js";
import { Product } from "../models/product.model.js";

// Create a new production record
export const createProduction = async (req, res) => {
  try {
    const { productName, noOfUnitsProduced, quantityOfRawMaterials } = req.body;

    // Validate input
    if (
      !productName ||
      !noOfUnitsProduced ||
      !Array.isArray(quantityOfRawMaterials)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid input. Ensure all fields are provided." });
    }

    // Find product by name and populate rawMaterials
    const product = await Product.findOne({ name: productName }).populate(
      "rawMaterials"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if requested raw materials exist in the product's rawMaterials
    const rawMaterialNames = quantityOfRawMaterials.map(
      (item) => item.rawMaterialName
    );
    const invalidMaterials = rawMaterialNames.filter(
      (name) => !product.rawMaterials.some((material) => material.name === name)
    );

    if (invalidMaterials.length > 0) {
      return res.status(400).json({
        message: "Some raw materials are not associated with the product.",
        invalidMaterials,
      });
    }

    // Check if there is enough stock for production
    const insufficientMaterials = quantityOfRawMaterials.filter((item) => {
      const rawMaterial = product.rawMaterials.find(
        (material) => material.name === item.rawMaterialName
      );
      return rawMaterial.stock < item.quantity;
    });

    if (insufficientMaterials.length > 0) {
      return res.status(400).json({
        message: "Production cannot happen due to insufficient raw materials.",
        insufficientMaterials: insufficientMaterials.map((item) => ({
          rawMaterialName: item.rawMaterialName,
          requiredQuantity: item.quantity,
          availableStock: product.rawMaterials.find(
            (material) => material.name === item.rawMaterialName
          ).stock,
        })),
      });
    }

    // Deduct raw material stock
    for (const item of quantityOfRawMaterials) {
      const rawMaterial = product.rawMaterials.find(
        (material) => material.name === item.rawMaterialName
      );
      rawMaterial.stock -= item.quantity;
      await rawMaterial.save();
    }
    // Increment product quantity
    product.quantity += noOfUnitsProduced;
    await product.save();

    // Convert raw material names to their IDs
    const updatedRawMaterials = quantityOfRawMaterials.map((item) => {
      const rawMaterial = product.rawMaterials.find(
        (material) => material.name === item.rawMaterialName
      );
      return { rawMaterialId: rawMaterial._id, quantity: item.quantity };
    });

    // Create production record
    const production = new Production({
      productId: product._id,
      noOfUnitsProduced,
      quantityOfRawMaterials: updatedRawMaterials,
    });

    await production.save();

    res
      .status(201)
      .json({ message: "Production record created successfully", production });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error creating production record",
        error: error.message,
      });
  }
};

export const updateProduction = async (req, res) => {
    try {
      const { id } = req.params;
      const { productName, noOfUnitsProduced, quantityOfRawMaterials } = req.body;
  
      // Validate input
      if (
        !productName ||
        !noOfUnitsProduced ||
        !Array.isArray(quantityOfRawMaterials)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid input. Ensure all fields are provided." });
      }
  
      // Find product by name
      const product = await Product.findOne({ name: productName }).populate(
        "rawMaterials"
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Find the existing production record
      const existingProduction = await Production.findById(id);
      if (!existingProduction) {
        return res.status(404).json({ message: "Production record not found" });
      }
  
      // Revert raw material stock and product quantity
      for (const item of existingProduction.quantityOfRawMaterials) {
        const rawMaterial = product.rawMaterials.find((material) =>
          material._id.equals(item.rawMaterialId)
        );
        if (rawMaterial) {
          rawMaterial.stock += item.quantity; // Revert stock
          await rawMaterial.save();
        }
      }
  
      // Revert the product quantity based on previous production
      product.quantity -= existingProduction.noOfUnitsProduced;
      await product.save();
  
      // Check if there is enough material for the new production quantities
      const insufficientMaterials = quantityOfRawMaterials.filter((item) => {
        const rawMaterial = product.rawMaterials.find(
          (material) => material.name === item.rawMaterialName
        );
        return !rawMaterial || rawMaterial.stock < item.quantity;
      });
  
      if (insufficientMaterials.length > 0) {
        return res.status(400).json({
          message: "Production cannot happen due to insufficient raw materials.",
          insufficientMaterials: insufficientMaterials.map((item) => ({
            rawMaterialName: item.rawMaterialName,
            requiredQuantity: item.quantity,
            availableQuantity:
              product.rawMaterials.find(
                (material) => material.name === item.rawMaterialName
              )?.stock || 0,
          })),
        });
      }
  
      // Deduct stock for the new production quantities
      for (const item of quantityOfRawMaterials) {
        const rawMaterial = product.rawMaterials.find(
          (material) => material.name === item.rawMaterialName
        );
        rawMaterial.stock -= item.quantity;
        await rawMaterial.save();
      }
  
      // Update product quantity based on the new production
      product.quantity += noOfUnitsProduced;
      await product.save();
  
      // Convert raw material names to their IDs
      const updatedRawMaterials = quantityOfRawMaterials.map((item) => {
        const rawMaterial = product.rawMaterials.find(
          (material) => material.name === item.rawMaterialName
        );
        return { rawMaterialId: rawMaterial._id, quantity: item.quantity };
      });
  
      // Update the production record
      const updatedProduction = await Production.findByIdAndUpdate(
        id,
        {
          productId: product._id,
          noOfUnitsProduced,
          quantityOfRawMaterials: updatedRawMaterials,
        },
        { new: true, runValidators: true }
      )
        .populate("productId", "name")
        .populate("quantityOfRawMaterials.rawMaterialId", "name");
  
      res.status(200).json({
        message: "Production record updated successfully",
        updatedProduction,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating production record",
        error: error.message,
      });
    }
  };
  

export const getAllProductions = async (req, res) => {
  try {
    // Fetch all productions
    const productions = await Production.find()
      .populate("productId", "name") // Populate productId with its name
      .populate("quantityOfRawMaterials.rawMaterialId", "name"); // Populate rawMaterialId with its name

    // Format the response to replace IDs with names
    const formattedProductions = productions.map((production) => ({
      productionId: production._id,
      productName: production.productId.name,
      noOfUnitsProduced: production.noOfUnitsProduced,
      quantityOfRawMaterials: production.quantityOfRawMaterials.map((item) => ({
        rawMaterialName: item.rawMaterialId.name,
        quantity: item.quantity,
      })),
    }));

    res.status(200).json({
      message: "Productions retrieved successfully",
      productions: formattedProductions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving productions",
      error: error.message,
    });
  }
};

export const deleteProduction = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the production record
    const existingProduction = await Production.findById(id).populate(
      "quantityOfRawMaterials.rawMaterialId"
    );
    if (!existingProduction) {
      return res.status(404).json({ message: "Production record not found" });
    }

    // Revert raw material stock
    for (const item of existingProduction.quantityOfRawMaterials) {
      const rawMaterial = item.rawMaterialId; // Populated rawMaterialId contains the document
      if (rawMaterial) {
        rawMaterial.stock += item.quantity; // Increment stock by used quantity
        await rawMaterial.save();
      }
    }

    // Revert product quantity
    const product = await Product.findById(existingProduction.productId);
    if (product) {
      product.quantity -= existingProduction.noOfUnitsProduced; // Decrease product quantity
      if (product.quantity < 0) product.quantity = 0; // Ensure quantity doesn't go below zero
      await product.save();
    }

    // Delete the production record
    await existingProduction.deleteOne();

    res.status(200).json({
      message: "Production record deleted successfully and changes reverted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting production record",
      error: error.message,
    });
  }
};

