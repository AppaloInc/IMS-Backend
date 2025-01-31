import express from "express";
import {
  createSale,
  updateSale,
  deleteSale,
  getAllSales,
  getSaleById,
  getSalesByPagination,
} from "../controllers/sales.controller.js"; // Adjust the path as per your project structure
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.get("/sales-detail/", verifyJWT, getSalesByPagination);
router.get("/", verifyJWT, getAllSales);
router.post("/add-sale", verifyJWT, createSale);
router.get("/:id", verifyJWT, getSaleById);
router.put("/:id", verifyJWT, updateSale);
router.delete("/:id", verifyJWT, deleteSale);
export default router;
