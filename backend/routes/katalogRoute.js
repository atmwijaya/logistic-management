import express from "express";
import {
  getAllKatalog,
  getKatalogById,
  createKatalog,
  updateKatalog,
  deleteKatalog,
  toggleStatusKatalog
} from "../controllers/katalogController.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllKatalog);
router.get("/:id", getKatalogById);

// ADMIN
router.post("/", createKatalog);
router.put("/:id", updateKatalog);
router.patch("/:id/toggle-status", toggleStatusKatalog);
router.delete("/:id", deleteKatalog);

export default router;
