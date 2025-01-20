import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

// Route to create a new product
router.post('/add-product', verifyJWT, createProduct);

// Route to fetch all products
router.get('/', verifyJWT, getAllProducts);

// Route to fetch a product by ID
router.get('/:id', verifyJWT, getProductById);

// Route to update a product by ID
router.put('/:id', verifyJWT, updateProduct);

// Route to delete a product by ID
router.delete('/:id', verifyJWT,deleteProduct);

export default router;
