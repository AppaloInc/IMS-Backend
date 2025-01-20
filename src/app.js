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
import materialRouter from './routes/rawMaterial.routes.js';
import orderRouter from './routes/order.routes.js';
import productRouter from './routes/product.routes.js';
import productionRouter from './routes/production.routes.js';
import salesRouter from './routes/sales.routes.js';

app.use('/api/v1/users',userRouter);
app.use('/api/v1/vendors',vendorRouter);
app.use('/api/v1/materials',materialRouter);
app.use('/api/v1/orders',orderRouter);
app.use('/api/v1/products',productRouter);
app.use('/api/v1/productions',productionRouter);
app.use('/api/v1/sales',salesRouter);
export { app }