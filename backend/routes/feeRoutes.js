import express from "express";

import {
  generateFee,
  getFees,
  updateFeeStatus,
  generateBulkFees,
} from "../controllers/feeController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


// ================= GENERATE FEE =================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  generateFee
);

router.delete("/delete-all", async (req, res) => {
  try {
    await Fee.deleteMany({});
    res.json({ message: "All fees deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ================= GET FEES =================
// admin → all
// student → own

router.get(
  "/",
  authMiddleware,
  getFees
);

router.post(
  "/bulk-generate",
  authMiddleware,
  generateBulkFees
);

// ================= UPDATE STATUS =================

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin","student"]),
  updateFeeStatus
);


export default router;