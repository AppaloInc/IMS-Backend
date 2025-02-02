import express from "express";
import { addMaterial, getMaterials, editMaterial, deleteMaterial, getMaterialById, getMaterialsByPagination } from "../controllers/rawMaterialStock.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Get all materials
router.get("/", verifyJWT, getMaterials);
router.get('/materials-detail/', verifyJWT, getMaterialsByPagination);
router.get('/:id', verifyJWT, getMaterialById)

// Add a new material
router.post("/add-material", verifyJWT, addMaterial);

// Edit a material by ID
router.put("/:id", verifyJWT, editMaterial);

// Delete a material by ID
router.delete("/:id", verifyJWT, deleteMaterial);

export default router;
