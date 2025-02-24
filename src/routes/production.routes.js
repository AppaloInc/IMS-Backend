import express from 'express';
import {
    createProduction,
    updateProduction,
    getAllProductions,
    getProductionByPagination,
    deleteProduction,
    getProductionById
} from '../controllers/production.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route to create a new product
router.get("/production-detail/", verifyJWT, getProductionByPagination);
router.get('/', verifyJWT, getAllProductions);
router.post('/add-production', verifyJWT, createProduction);
router.get('/:id', verifyJWT, getProductionById);
router.put('/:id', verifyJWT, updateProduction);
router.delete('/:id', verifyJWT, deleteProduction);
export default router;
