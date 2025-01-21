import express from "express";
import { addMaterial, getMaterials, editMaterial, deleteMaterial } from "../controllers/rawMaterialStock.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Add a new material
router.post("/add-material", verifyJWT, addMaterial);

// Get all materials
router.get("/", verifyJWT, getMaterials);

// Edit a material by ID
router.put("/:id", verifyJWT, editMaterial);

// Delete a material by ID
router.delete("/:id", verifyJWT, deleteMaterial);

export default router;
