import { Router } from "express";
import { broadcastMessage, getBroadcastStatus } from "../controllers/broadcastController.js";

const router = Router();

router.post("/broadcast", broadcastMessage);
router.get("/status/:jobId", getBroadcastStatus);

export default router;
