import express from "express";

import {
  addStudent,
  getAllStudents,
  getMyStudent,
  updateStudent,
  deactivateStudent,
  autoAllocateRoom,
  deallocateRoom,
  autoAllocateAll
} from "../controllers/studentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/auto-allocate-all",
authMiddleware,autoAllocateAll
)
// ================= ADD STUDENT =================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  addStudent
);


// ================= GET ALL (ADMIN) =================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllStudents
);


// ================= GET CURRENT STUDENT =================

router.get(
  "/me",
  authMiddleware,
  getMyStudent
);


// ================= UPDATE =================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateStudent
);


// ================= DEACTIVATE =================

router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware(["admin"]),
  deactivateStudent
);


// ================= ALLOCATE ROOM =================

router.post(
  "/allocate-room",
  authMiddleware,
  roleMiddleware(["admin"]),
  autoAllocateRoom
);


// ================= DEALLOCATE ROOM =================

router.patch(
  "/deallocate-room",
  authMiddleware,
  roleMiddleware(["admin"]),
  deallocateRoom
);
console.log("students routes loaded");


export default router;