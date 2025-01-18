import express from 'express';
import { 
    createOrder, 
    getAllOrders, 
    // getOrderById, 
    editOrder, 
    deleteOrder, 
    receiveOrder 
} from '../controllers/order.controller.js';

const router = express.Router();

// Route to create a new order
router.post('/add-order', createOrder);

// Route to get all orders
router.get('/', getAllOrders);

// Route to get an order by ID
// router.get('/:orderId', getOrderById);

// Route to update an order
router.put('/:id', editOrder);

// Route to delete an order
router.delete('/:id', deleteOrder);

// Route to mark an order as received
router.post('/receive/:id', receiveOrder);

export default router;
