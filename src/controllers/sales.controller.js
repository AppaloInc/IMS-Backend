import {Sales} from "../models/sales.model.js";
import {Product} from "../models/product.model.js";

export const createSale = async (req, res) => {
  try {
    const { productName, customerName, noOfUnitsSold } = req.body;

    // Validate input
    if (!productName || !noOfUnitsSold) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Find the product by name
    const product = await Product.findOne({ name: productName });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate total sale
    const totalSale = noOfUnitsSold * product.pricePerUnit;

    // Check product stock
    if (product.quantity < noOfUnitsSold) {
      return res
        .status(400)
        .json({ message: "Insufficient product stock for the sale" });
    }

    // Decrement product quantity
    product.quantity -= noOfUnitsSold;
    await product.save();

    // Create sale record
    const sale = new Sales({
      productId: product._id,
      customerName,
      noOfUnitsSold,
      totalSale,
    });

    await sale.save();

    res.status(201).json({
      message: "Sale recorded successfully",
      sale,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating sale record",
      error: error.message,
    });
  }
};

export const updateSale = async (req, res) => {
    try {
      const { id } = req.params; // Sale ID
      const { productName, customerName, noOfUnitsSold } = req.body;
  
      // Validate input
      if (!productName || !noOfUnitsSold) {
        return res.status(400).json({ message: "Invalid input data" });
      }
  
      // Find the sale record
      const existingSale = await Sales.findById(id);
      if (!existingSale) {
        return res.status(404).json({ message: "Sale record not found" });
      }
  
      // Find the product by name
      const product = await Product.findOne({ name: productName });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Adjust product stock based on the difference in units sold
      const unitsDifference = noOfUnitsSold - existingSale.noOfUnitsSold;
  
      if (product.quantity < unitsDifference) {
        return res
          .status(400)
          .json({ message: "Insufficient product stock for the update" });
      }
  
      product.quantity -= unitsDifference; // Adjust stock
      await product.save();
  
      // Update the sale record
      existingSale.customerName = customerName;
      existingSale.noOfUnitsSold = noOfUnitsSold;
      existingSale.totalSale = noOfUnitsSold * product.pricePerUnit;
  
      await existingSale.save();
  
      res.status(200).json({
        message: "Sale updated successfully",
        sale: existingSale,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating sale record",
        error: error.message,
      });
    }
  };

  export const deleteSale = async (req, res) => {
    try {
      const { id } = req.params; // Sale ID
  
      // Find the sale record
      const sale = await Sales.findById(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale record not found" });
      }
  
      // Find the product
      const product = await Product.findById(sale.productId);
      if (!product) {
        return res.status(404).json({ message: "Associated product not found" });
      }
  
      // Revert product stock
      product.quantity += sale.noOfUnitsSold;
      await product.save();
  
      // Delete the sale record
      await sale.remove();
  
      res.status(200).json({ message: "Sale deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting sale record",
        error: error.message,
      });
    }
  };

  export const getAllSales = async (req, res) => {
    try {
      // Fetch all sales
      const sales = await Sales.find()
        .populate("productId", "name pricePerUnit") // Populate productId with its name and pricePerUnit
        .exec();
  
      // Calculate total sales for each record and overall total sales
      let totalSalesAmount = 0;
  
      const formattedSales = sales.map((sale) => {
        const saleAmount = sale.noOfUnitsSold * sale.productId.pricePerUnit;
        totalSalesAmount += saleAmount;
  
        return {
          saleId: sale._id,
          productName: sale.productId.name,
          customerName: sale.customerName,
          noOfUnitsSold: sale.noOfUnitsSold,
          totalSale: saleAmount,
          pricePerUnit: sale.productId.pricePerUnit,
          createdAt: sale.createdAt,
        };
      });
  
      res.status(200).json({
        message: "Sales retrieved successfully",
        sales: formattedSales,
        totalSalesAmount, // Add overall total sales to the response
      });
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving sales records",
        error: error.message,
      });
    }
  };
  
  
