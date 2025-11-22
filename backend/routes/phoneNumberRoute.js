import express from "express";
import { getPhoneNumber, updatePhoneNumber } from "../controllers/phoneNumberController.js";

const router = express.Router();

router.get("/", getPhoneNumber);
router.put("/", updatePhoneNumber);

export default router;