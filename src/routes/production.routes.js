import express from 'express';
import {
    createProduction,
    updateProduction,
    getAllProductions
} from '../controllers/production.controller.js';

const router = express.Router();

// Route to create a new product
router.post('/add-production', createProduction);
router.put('/:id',updateProduction);
router.get('/', getAllProductions);
export default router;
