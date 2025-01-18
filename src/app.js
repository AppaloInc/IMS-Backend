import express from 'express';
import cors from 'cors';
// import cookieParser from 'cookie-parser';
const app = express();
app.use(cors())
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended: true, limit:'16kb'}));
app.use(express.static('public'))

import userRouter from './routes/user.routes.js';
import vendorRouter from './routes/vendor.routes.js';
import materialRouter from './routes/material.routes.js'
import orderRouter from './routes/order.routes.js'
app.use('/api/v1/users',userRouter);
app.use('/api/v1/vendors',vendorRouter);
app.use('/api/v1/materials',materialRouter);
app.use('/api/v1/orders',orderRouter);
export { app }