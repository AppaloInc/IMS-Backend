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

    // Validate materials and map to their IDs with costPerUnit
    const materialNames = materials.map((item) => item.name);
    const materialDocs = await Material.find({ name: { $in: materialNames } });

    if (materialDocs.length !== materials.length) {
      const foundNames = materialDocs.map((m) => m.name);
      const missingMaterials = materialNames.filter((name) => !foundNames.includes(name));
      return res.status(400).json({
        message: `Some materials not found: ${missingMaterials.join(", ")}`,
      });
    }

    // Map material IDs with costPerUnit
    const materialsWithCost = materials.map((item) => {
      const materialDoc = materialDocs.find((m) => m.name === item.name);
      return {
        material: materialDoc._id,
        costPerUnit: item.costPerUnit,
      };
    });

    // Create the vendor
    const vendor = new Vendor({
      name,
      contact,
      email,
      address,
      materials: materialsWithCost,
    });
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

    let materialsWithCost;
    if (materials) {
      // Validate materials and map to their IDs with costPerUnit
      const materialNames = materials.map((item) => item.name);
      const materialDocs = await Material.find({ name: { $in: materialNames } });

      if (materialDocs.length !== materials.length) {
        const foundNames = materialDocs.map((m) => m.name);
        const missingMaterials = materialNames.filter((name) => !foundNames.includes(name));
        return res.status(400).json({
          message: `Some materials not found: ${missingMaterials.join(", ")}`,
        });
      }

      // Map material IDs with costPerUnit
      materialsWithCost = materials.map((item) => {
        const materialDoc = materialDocs.find((m) => m.name === item.name);
        return {
          material: materialDoc._id,
          costPerUnit: item.costPerUnit,
        };
      });
    }

    // Update the vendor
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { ...updates, ...(materialsWithCost && { materials: materialsWithCost }) },
      { new: true }
    ).populate("materials.material");

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
      // Fetch all vendors and populate the materials array with the name of each material
      const vendors = await Vendor.find().populate({
        path: "materials.material", // Populate the material field inside the materials array
        select: "name", // Only select the name of the material
      });
  
      // Modify materials to flatten the structure and include name, costPerUnit, and _id
      const modifiedVendors = vendors.map((vendor) => ({
        ...vendor.toObject(), // Convert Mongoose document to plain object
        materials: vendor.materials.map((material) => ({
          name: material.material?.name || null, // Material name
          costPerUnit: material.costPerUnit, // Cost per unit
          // _id: material._id, // Material entry ID
        })),
      }));
  
      res.status(200).json({ message: "Vendors retrieved successfully", vendors: modifiedVendors });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving vendors", error: error.message });
    }
  };
  
  
  
  