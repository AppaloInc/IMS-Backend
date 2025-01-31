import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVendor, getAllVendors, editVendor, deleteVendor, getVendorById, getVendorsByPagination } from "../controllers/vendor.controller.js";
const router = Router();



// Add a new vendor
router.post("/add-vendor", verifyJWT, addVendor);

// Get all vendors (with materials)
router.get("/", verifyJWT, getAllVendors);
router.get("/vendors-detail/", verifyJWT, getVendorsByPagination);
router.get("/:id", verifyJWT, getVendorById);


// Edit a vendor by ID
router.put("/:id", verifyJWT, editVendor);

// Delete a vendor by ID
router.delete("/:id", verifyJWT, deleteVendor);

export default router;
