// import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Material } from "../models/material.model.js";

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { vendorName, materialName, quantity } = req.body;

        // Find vendor by name
        const vendor = await Vendor.findOne({ name: vendorName });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        // Find the material's ID by its name
        const material = await Material.findOne({ name: materialName });
        if (!material) return res.status(404).json({ message: "Material not found" });

        // Find the material entry in the vendor's materials array
        const materialEntry = vendor.materials.find(
            (item) => item.material.toString() === material._id.toString()
        );

        if (!materialEntry) {
            return res.status(404).json({
                message: `Material "${materialName}" not found in vendor's material list`,
            });
        }

        // Extract cost per unit
        const costPerUnit = materialEntry.costPerUnit;

        // Calculate total cost
        const totalCost = quantity * costPerUnit;

        // Create new order
        const order = new Order({
            vendor: vendor._id,
            material: material._id,
            quantity,
            costPerUnit,
            totalCost,
        });

        // Save the order
        await order.save();

        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};


// Get all orders
export const getAllOrders = async (req, res) => {
    try {
        // Fetch orders, populate references, and sort by status (Pending first, then Received)
        const orders = await Order.find()
            .populate("vendor", "name")
            .populate("material", "name")
            .sort({ status: 1 }); // Assuming "Pending" comes before "Received" lexicographically or numerically

        // Format response to include names instead of IDs
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            vendor: order.vendor.name,
            material: order.material.name,
            quantity: order.quantity,
            costPerUnit: order.costPerUnit,
            totalCost: order.totalCost,
            status: order.status,
        }));

        res.status(200).json({ message: "Orders retrieved successfully", orders: formattedOrders });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders", error: error.message });
    }
};

export const getOrdersByPagination = async (req, res) => {
    try {
        // Extract page and limit from query parameters, set default values if not provided
        const page = parseInt(req.query.page) || 1; // Default page is 1
        const limit = 10; // Number of orders per page
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        // Fetch orders with pagination and populate vendor and material names
        const orders = await Order.find()
            .populate({ path: "vendor", select: "name" })
            .populate({ path: "material", select: "name" })
            .sort({ status: 1 }) // Sorting orders by status (Pending first)
            .skip(skip) // Skip the required number of documents
            .limit(limit); // Limit results to 10 orders per page

        // Modify orders to return formatted data
        const modifiedOrders = orders.map(order => ({
            _id: order._id,
            vendor: order.vendor?.name || null,
            material: order.material?.name || null,
            quantity: order.quantity,
            costPerUnit: order.costPerUnit,
            totalCost: order.totalCost,
            status: order.status,
        }));

        // Get total number of orders for pagination metadata
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders: modifiedOrders,
            currentPage: page,
            totalPages,
            totalOrders,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders", error: error.message });
    }
};


// Update order status to 'Received' and update material stock
export const receiveOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the order by ID
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status === "Received") {
            return res.status(400).json({ message: "Order has already been received" });
        }

        // Update material stock
        const material = await Material.findById(order.material);
        if (!material) return res.status(404).json({ message: "Material not found" });

        material.stock = (material.stock || 0) + order.quantity;
        await material.save();

        // Update order status
        order.status = "Received";
        await order.save();

        res.status(200).json({ message: "Order received and stock updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Error receiving order", error: error.message });
    }
};
//edit/update order
export const editOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendorName, materialName, quantity } = req.body;

        // Validate inputs
        if (!vendorName || !materialName || !quantity) {
            return res.status(400).json({ message: "Vendor name, material name, and quantity are required." });
        }

        // Find the vendor
        const vendor = await Vendor.findOne({ name: vendorName });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        // Find the material
        const material = await Material.findOne({ name: materialName });
        if (!material) return res.status(404).json({ message: "Material not found" });

        // Check if the vendor offers the specified material
        const materialEntry = vendor.materials.find(
            (item) => item.material.toString() === material._id.toString()
        );
        if (!materialEntry) {
            return res.status(400).json({ message: "Material not offered by the specified vendor." });
        }

        // Get costPerUnit from vendor's material list
        const costPerUnit = materialEntry.costPerUnit;

        // Recalculate the total cost
        const totalCost = quantity * costPerUnit;

        // Find and update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                vendor: vendor._id,
                material: material._id,
                quantity,
                costPerUnit,
                totalCost,
            },
            { new: true } // Return the updated order
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Error updating order", error: error.message });
    }
};

// Delete an order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting order", error: error.message });
    }
};


export const getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find order by ID and populate vendor and material details
      const order = await Order.findById(id)
        .populate("vendor", "name") // Populate vendor name
        .populate("material", "name"); // Populate material name
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Format response to include names instead of IDs
      const formattedOrder = {
        _id: order._id,
        vendor: order.vendor?.name || null, // Vendor name
        material: order.material?.name || null, // Material name
        quantity: order.quantity,
        costPerUnit: order.costPerUnit,
        totalCost: order.totalCost,
        status: order.status,
      };
  
      res.status(200).json({ message: "Order retrieved successfully", order: formattedOrder });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving order", error: error.message });
    }
  };
  