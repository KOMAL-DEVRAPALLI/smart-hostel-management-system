import express from "express";

import {
  raiseComplaint,
  getComplaints,
  updateComplaintStatus,
} from "../controllers/complaintController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


// ================= RAISE =================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["student"]),
  raiseComplaint
);


// ================= GET =================
// admin → all
// student → own

router.get(
  "/",
  authMiddleware,
  getComplaints
);


// ================= UPDATE STATUS =================

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateComplaintStatus
);


export default router;