import express from "express";
import { addMaterial, getMaterials, editMaterial, deleteMaterial } from "../controllers/stock.controller.js";

const router = express.Router();

// Add a new material
router.post("/add-material", addMaterial);

// Get all materials
router.get("/", getMaterials);

// Edit a material by ID
router.put("/:id", editMaterial);

// Delete a material by ID
router.delete("/:id", deleteMaterial);

export default router;
