import { Material } from "../models/material.model.js";

/**
 * Add a new material
 */
export const addMaterial = async (req, res) => {
  try {
    const { name, stock, unit, costPerUnit, description } = req.body;

    // Check if the material already exists
    const existingMaterial = await Material.findOne({ name });
    if (existingMaterial) {
      return res.status(400).json({ message: "Material already exists" });
    }

    // Create a new material
    const material = new Material({ name, stock, unit, costPerUnit, description });
    await material.save();

    res.status(201).json({ message: "Material added successfully", material });
  } catch (error) {
    res.status(500).json({ message: "Error adding material", error: error.message });
  }
};

/**
 * Get all materials
 */
export const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials", error: error.message });
  }
};

/**
 * Edit an existing material
 */
export const editMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find material by ID and update
    const updatedMaterial = await Material.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json({ message: "Material updated successfully", updatedMaterial });
  } catch (error) {
    res.status(500).json({ message: "Error updating material", error: error.message });
  }
};

/**
 * Delete a material
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    // Find material by ID and delete
    const deletedMaterial = await Material.findByIdAndDelete(id);

    if (!deletedMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting material", error: error.message });
  }
};
