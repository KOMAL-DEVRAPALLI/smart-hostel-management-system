import express from "express";
import { getDashboardData } from "../controllers/chartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getDashboardData
);

export default router;