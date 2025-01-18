import { Vendor } from "../models/vendor.model.js";
import { Material } from "../models/material.model.js";

/**
 * Add a new vendor
 */
export const addVendor = async (req, res) => {
  try {
    const { name, contact, email, address, materials } = req.body;


    // Check if the vendor already exists
    const existingVendor = await Vendor.findOne({ $or: [{ name }, { email }] });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    // Convert material names to IDs
    const materialDocs = await Material.find({ name: { $in: materials } });

    if (materialDocs.length !== materials.length) {
      const foundNames = materialDocs.map((m) => m.name);
      const missingMaterials = materials.filter((name) => !foundNames.includes(name));
      return res.status(400).json({
        message: `Some materials not found: ${missingMaterials.join(", ")}`,
      });
    }

    // Extract IDs from found materials
    const materialIds = materialDocs.map((m) => m._id);

    // Create the vendor
    const vendor = new Vendor({ name, contact, email, address, materials: materialIds });
    await vendor.save();

    res.status(201).json({ message: "Vendor added successfully", vendor });
  } catch (error) {
    res.status(500).json({ message: "Error adding vendor", error: error.message });
  }
};

/**
 * Edit an existing vendor
 */
export const editVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { materials, ...updates } = req.body;

    let materialIds;
    if (materials) {
      // Convert material names to IDs
      const materialDocs = await Material.find({ name: { $in: materials } });

      if (materialDocs.length !== materials.length) {
        const foundNames = materialDocs.map((m) => m.name);
        const missingMaterials = materials.filter((name) => !foundNames.includes(name));
        return res.status(400).json({
          message: `Some materials not found: ${missingMaterials.join(", ")}`,
        });
      }

      materialIds = materialDocs.map((m) => m._id);
    }

    // Update the vendor
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { ...updates, ...(materialIds && { materials: materialIds }) },
      { new: true }
    ).populate("materials");

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ message: "Vendor updated successfully", updatedVendor });
  } catch (error) {
    res.status(500).json({ message: "Error updating vendor", error: error.message });
  }
};


export const deleteVendor = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find vendor by ID and delete
      const deletedVendor = await Vendor.findByIdAndDelete(id);
  
      if (!deletedVendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
  
      res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting vendor", error: error.message });
    }
  };
  
  export const getAllVendors = async (req, res) => {
    try {
      // Fetch all vendors and populate the materials field with the name and costPerUnit of each material
      const vendors = await Vendor.find()
        .populate({
          path: "materials", // Populate the materials array directly
          select: "name -_id" // Select only name
        });
  
      // Return the modified vendors array with the populated materials
      res.status(200).json({ message: "Vendors retrieved successfully", vendors });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving vendors", error: error.message });
    }
  };
  
  