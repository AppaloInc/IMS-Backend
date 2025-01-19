import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js';

const router = express.Router();

// Route to create a new product
router.post('/add-product', createProduct);

// Route to fetch all products
router.get('/', getAllProducts);

// Route to fetch a product by ID
router.get('/:id', getProductById);

// Route to update a product by ID
router.put('/:id', updateProduct);

// Route to delete a product by ID
router.delete('/:id', deleteProduct);

export default router;
