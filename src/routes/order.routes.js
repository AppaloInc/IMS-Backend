import express from 'express';
import { 
    createOrder, 
    getAllOrders, 
    getOrderById, 
    editOrder, 
    deleteOrder, 
    receiveOrder 
} from '../controllers/order.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

// Route to create a new order
router.post('/add-order', verifyJWT, createOrder);

// Route to get all orders
router.get('/', verifyJWT, getAllOrders);
router.get('/:id',verifyJWT, getOrderById)

// Route to get an order by ID
// router.get('/:orderId', getOrderById);

// Route to update an order
router.put('/:id', verifyJWT, editOrder);

// Route to delete an order
router.delete('/:id', verifyJWT, deleteOrder);

// Route to mark an order as received
router.post('/receive/:id', verifyJWT, receiveOrder);

export default router;
