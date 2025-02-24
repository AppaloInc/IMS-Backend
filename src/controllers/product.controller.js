import { Product } from '../models/product.model.js';
import { Material } from '../models/material.model.js';

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { name, quantity, pricePerUnit, rawMaterials } = req.body;
        console.log(rawMaterials)

        // Validate input
        if (!name || !quantity || !pricePerUnit || !Array.isArray(rawMaterials)) {
            return res.status(400).json({ message: "Invalid input. Ensure all fields are provided." });
        }

        // Find raw materials by names
        const rawMaterialsDocs = await Material.find({ name: { $in: rawMaterials } });

        // Check if all raw materials are found
        if (rawMaterialsDocs.length !== rawMaterials.length) {
            const missingMaterials = rawMaterials.filter(
                (name) => !rawMaterialsDocs.some((material) => material.name === name)
            );
            return res.status(404).json({
                message: "Some raw materials were not found.",
                missingMaterials,
            });
        }

        // Extract IDs of raw materials
        const rawMaterialIds = rawMaterialsDocs.map((material) => material._id);

        // Create and save the product
        const product = new Product({
            name,
            quantity,
            pricePerUnit,
            rawMaterials: rawMaterialIds,
        });

        await product.save();

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
      // Fetch all products and populate rawMaterials with only the name
      const products = await Product.find({ isAvailable: true }).populate('rawMaterials', 'name');
  
      // Format the products to exclude _id from rawMaterials
      const formattedProducts = products.map(product => ({
        _id: product._id,
        name: product.name,
        quantity: product.quantity,
        pricePerUnit: product.pricePerUnit,
        rawMaterials: product.rawMaterials.map(material => ({
          name: material.name,
        })),
        __v: product.__v,
      }));
  
      res.status(200).json({
        message: "Products retrieved successfully",
        products: formattedProducts,
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving products", error: error.message });
    }
  };
  

/**
 * Get a product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by ID and populate rawMaterials with their names
    const product = await Product.findById(id).populate('rawMaterials', 'name');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Format the response to exclude _id from rawMaterials
    const formattedProduct = {
      _id: product._id,
      name: product.name,
      quantity: product.quantity,
      pricePerUnit: product.pricePerUnit,
      rawMaterials: product.rawMaterials.map(material => ({
        name: material.name,
      })),
      __v: product.__v,
    };

    res.status(200).json({
      message: "Product retrieved successfully",
      product: formattedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product", error: error.message });
  }
};

export const getProductsByPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default: page 1, 10 products per page

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Fetch paginated products, populating rawMaterials with only the name
    const products = await Product.find({ isAvailable: true })
      .populate("rawMaterials", "name")
      .skip(skip)
      .limit(pageSize);

    // Get the total count of available products
    const totalProducts = await Product.countDocuments({ isAvailable: true });
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Format the response
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      quantity: product.quantity,
      pricePerUnit: product.pricePerUnit,
      rawMaterials: product.rawMaterials.map(material => ({ name: material.name })),
      __v: product.__v,
    }));

    res.status(200).json({
      message: "Products retrieved successfully",
      currentPage: pageNumber,
      totalPages,
      totalProducts,
      products: formattedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products", error: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
      const { id } = req.params; // Extract product ID from the URL
      const { rawMaterials, ...updates } = req.body; // Separate rawMaterials from other updates
  
      let rawMaterialIds = null;
  
      if (rawMaterials) {
        // Validate and fetch raw materials
        const rawMaterialsDocs = await Material.find({ name: { $in: rawMaterials } });
  
        // Check if all provided raw materials exist in the database
        if (rawMaterialsDocs.length !== rawMaterials.length) {
          const missingMaterials = rawMaterials.filter(
            (name) => !rawMaterialsDocs.some((material) => material.name === name)
          );
          return res.status(404).json({
            message: "Some raw materials were not found.",
            missingMaterials,
          });
        }
  
        // Map raw material documents to their IDs
        rawMaterialIds = rawMaterialsDocs.map((material) => material._id);
      }
  
      // Update the product in the database
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { ...updates, ...(rawMaterialIds && { rawMaterials: rawMaterialIds }) },
        { new: true, runValidators: true }
      ).populate("rawMaterials"); // Populate rawMaterials for clarity in response
  
      // Check if the product was found and updated
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Respond with success
      res.status(200).json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
      // Handle server errors
      res.status(500).json({ message: "Error updating product", error: error.message });
    }
  };
  
  

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product and update its availability
    const product = await Product.findByIdAndUpdate(
        id, 
        { isAvailable: false }, // Set isAvailable to false
        { new: true } // Return the updated document
    );

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product marked as unavailable", product });
} catch (error) {
    res.status(500).json({ message: "Error marking product as unavailable", error: error.message });
}
};
