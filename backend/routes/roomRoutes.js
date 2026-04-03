import express from "express";

import {
  addRoom,
  getAllRooms,
  updateRoom,
  deactivateRoom,
} from "../controllers/roomController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


// ================= ADD ROOM =================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  addRoom
);


// ================= GET ALL ROOMS =================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllRooms
);


// ================= UPDATE ROOM =================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateRoom
);


// ================= DEACTIVATE ROOM =================

router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware(["admin"]),
  deactivateRoom
);


export default router;