import express from 'express';
import {
    createProduction,
    updateProduction,
    getAllProductions,
    deleteProduction,
    getProductionById
} from '../controllers/production.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route to create a new product
router.post('/add-production', verifyJWT, createProduction);
router.get('/:id', verifyJWT, getProductionById);
router.put('/:id', verifyJWT, updateProduction);
router.get('/', verifyJWT, getAllProductions);
router.delete('/:id', verifyJWT, deleteProduction);
export default router;
