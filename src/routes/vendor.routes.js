import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVendor, getAllVendors, editVendor, deleteVendor } from "../controllers/vendor.controller.js";
const router = Router();



// Add a new vendor
router.post("/add-vendor", addVendor);

// Get all vendors (with materials)
router.get("/", getAllVendors);

// Edit a vendor by ID
router.put("/:id", editVendor);

// Delete a vendor by ID
router.delete("/:id", deleteVendor);

export default router;
