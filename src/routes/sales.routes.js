import express from "express";
import {
  createSale,
  updateSale,
  deleteSale,
  getAllSales,
} from "../controllers/sales.controller.js"; // Adjust the path as per your project structure
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/add-sale", verifyJWT, createSale);

router.put("/:id", verifyJWT, updateSale);

router.delete("/:id", verifyJWT, deleteSale);

router.get("/", verifyJWT, getAllSales);

export default router;
